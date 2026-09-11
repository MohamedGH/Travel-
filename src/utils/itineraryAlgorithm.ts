import {
  GeoLocation,
  TransportMode,
  TravelTicketOption,
  TravelItinerary,
  TravelSegment,
  PrayerName,
  PrayerStopRecommendation,
} from '../types';
import {
  calculateDistanceKm,
  computePrayersForLocation,
  isTravelDistanceEligible,
} from './prayerCalculator';

export interface AlgorithmParams {
  origin: GeoLocation;
  destination: GeoLocation;
  travelDate: string; // "YYYY-MM-DD"
  departureTime: string; // "HH:mm"
  calculationMethod?: string;
  asrMethod?: 'standard' | 'hanafi';
  allowedModes?: TransportMode[];
  sortBy?: 'cost' | 'duration' | 'salat';
}

/**
 * Checks salât windows against travel timeline and evaluates prayer accommodations
 */
function analyzeSalatSchedule(
  depHours: number,
  depMinutes: number,
  arrHours: number,
  arrMinutes: number,
  mode: TransportMode,
  prayerTimes: Record<string, string>,
  isEligibleForQasr: boolean,
  originName: string,
  destName: string,
  qiblaBearing: number
) {
  const depTotalMinutes = depHours * 60 + depMinutes;
  const arrTotalMinutes = arrHours * 60 + arrMinutes;

  const prayersList: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayersChecked: TravelTicketOption['prayersChecked'] = [];
  const enRoutePrayers: PrayerName[] = [];
  const prayerStops: PrayerStopRecommendation[] = [];
  const highlights: string[] = [];

  let salatScore = 85; // Base score

  prayersList.forEach((prayer) => {
    const timeStr = prayerTimes[prayer];
    if (!timeStr) return;

    const [pH, pM] = timeStr.split(':').map(Number);
    const pTotalMinutes = pH * 60 + pM;

    // Check if prayer falls:
    // 1. Just before departure (within 1 hour before)
    if (pTotalMinutes >= depTotalMinutes - 60 && pTotalMinutes <= depTotalMinutes) {
      const loc = mode === 'flight'
        ? `Salle de prière multiconfessionnelle (Aéroport ${originName})`
        : mode === 'train'
        ? `Gare de ${originName} (Espace de recueillement ou mosquée à proximité)`
        : `Avant le départ de ${originName}`;

      prayersChecked.push({
        name: prayer,
        status: 'prayed_before_departure',
        time: timeStr,
        locationDesc: loc,
      });

      highlights.push(`${prayer} (${timeStr}) priée avant l'embarquement à ${originName}`);
      salatScore += 5;
    }
    // 2. During transit
    else if (pTotalMinutes > depTotalMinutes && pTotalMinutes < arrTotalMinutes) {
      enRoutePrayers.push(prayer);

      let locDesc = '';
      let stopType: PrayerStopRecommendation['locationType'] = 'highway_rest_area';

      if (mode === 'car') {
        locDesc = `Aire d'autoroute avec sanitaires et espace propre (Halte recommandée à ${timeStr})`;
        stopType = 'highway_rest_area';
        highlights.push(`Pause programmée sur aire de repos pour ${prayer} à ${timeStr}`);
        salatScore += 8; // Full control
      } else if (mode === 'train') {
        locDesc = `À bord du train (plateforme calme ou siège) ou arrêt en gare intermédiaire`;
        stopType = 'train_station';
        highlights.push(`${prayer} en transit ferroviaire (Regroupement Jam' recommandé)`);
        salatScore += 4;
      } else if (mode === 'flight') {
        locDesc = `À bord de l'appareil (Prière assise avec inclinaison si turbulences) ou Jam' Taqdim/Ta'khir`;
        stopType = 'airport_prayer_room';
        highlights.push(`${prayer} en vol : Jam' (regroupement) conseillé au sol`);
        salatScore += 3;
      } else {
        locDesc = `Salle de prière dédiée sur le navire (Pont passagers)`;
        stopType = 'onboard';
        highlights.push(`Salle de prière maritime disponible à bord pour ${prayer}`);
        salatScore += 6;
      }

      prayersChecked.push({
        name: prayer,
        status: 'stop_en_route',
        time: timeStr,
        locationDesc: locDesc,
      });

      prayerStops.push({
        id: `stop-${prayer.toLowerCase()}-${Date.now()}`,
        prayerName: prayer,
        recommendedTime: timeStr,
        locationName: locDesc,
        locationType: stopType,
        suggestedDurationMinutes: mode === 'car' ? 25 : 15,
        fiqhAdvice: isEligibleForQasr
          ? `Voyageur : Qasr (2 unités) & regroupement Jam' autorisé.`
          : `Prière complète dans son temps prescrit.`,
        qiblaBearing,
      });
    }
    // 3. Just after arrival (within 1 hour after)
    else if (pTotalMinutes >= arrTotalMinutes && pTotalMinutes <= arrTotalMinutes + 75) {
      const loc = mode === 'flight'
        ? `Salle de prière de l'aéroport d'arrivée (${destName})`
        : mode === 'train'
        ? `Gare d'arrivée (${destName}) ou mosquée du quartier`
        : `À l'arrivée à ${destName}`;

      prayersChecked.push({
        name: prayer,
        status: 'prayed_at_arrival',
        time: timeStr,
        locationDesc: loc,
      });

      highlights.push(`${prayer} (${timeStr}) accomplie paisiblement à l'arrivée à ${destName}`);
      salatScore += 4;
    }
  });

  // If no prayers crossed during transit, add Dhuhr/Asr comfort highlight
  if (enRoutePrayers.length === 0) {
    highlights.push("Trajet hors des temps de prière majeurs : tranquillité d'esprit optimale");
    salatScore += 10;
  }

  // Cap score between 75 and 100
  const normalizedScore = Math.min(100, Math.max(75, salatScore));

  let compatibilityLabel: TravelTicketOption['salatCompatibilityLabel'] = 'Excellente';
  if (normalizedScore < 85) compatibilityLabel = 'Modérée';
  else if (normalizedScore < 94) compatibilityLabel = 'Très Bonne';

  const rukhsahAdvice = isEligibleForQasr
    ? "Rukhsah al-Safar active : Dhuhr, Asr et Isha sont raccourcies à 2 rak'ahs. Le regroupement (Jam' Taqdim avant départ ou Jam' Ta'khir à l'arrivée) est une facilité prophétique vivement recommandée."
    : "Distance locale (< 80 km) : chaque prière est accomplie en son temps sous son format normal.";

  return {
    prayersChecked,
    enRoutePrayers,
    prayerStops,
    salatScore: normalizedScore,
    salatCompatibilityLabel: compatibilityLabel,
    salatHighlights: highlights,
    rukhsahAdvice,
  };
}

/**
 * Format duration into "XhYY"
 */
function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * Calculate estimated ticket prices based on mode, distance, and realistic market rates
 */
function calculateEstimatedCost(mode: TransportMode, distanceKm: number): {
  totalEuro: number;
  baseFare: number;
  taxesOrTolls: number;
  details: string;
} {
  let baseFare = 0;
  let taxesOrTolls = 0;
  let details = '';

  switch (mode) {
    case 'car': {
      // Carsharing / Covoiturage option (cheapest car option) or fuel + tolls
      // Tolls estimate: ~0.075 €/km, Fuel estimate: 7L/100km @ 1.85€ = ~0.13 €/km
      const fuelCost = Math.round(distanceKm * 0.125);
      const tollsCost = Math.round(distanceKm * 0.07);
      // Cost per person in shared ride or solo
      const sharedCost = Math.max(12, Math.round((fuelCost + tollsCost) * 0.45));
      baseFare = Math.round(sharedCost * 0.7);
      taxesOrTolls = Math.round(sharedCost * 0.3);
      details = `Estimation covoiturage / partage de frais carburant (${fuelCost}€) & péages (${tollsCost}€)`;
      return { totalEuro: baseFare + taxesOrTolls, baseFare, taxesOrTolls, details };
    }

    case 'train': {
      // High-speed rail / Intercités pricing curve (economies of scale)
      // Base: 15€ + 0.085 €/km for first 400km, then 0.065 €/km
      let price = 18;
      if (distanceKm <= 400) {
        price += distanceKm * 0.085;
      } else {
        price += 400 * 0.085 + (distanceKm - 400) * 0.062;
      }
      const roundedTotal = Math.max(19, Math.round(price));
      baseFare = Math.round(roundedTotal * 0.88);
      taxesOrTolls = roundedTotal - baseFare;
      details = `Billet 2nde classe standard TGV/Intercités avec réservation de siège et espace bagages`;
      return { totalEuro: roundedTotal, baseFare, taxesOrTolls, details };
    }

    case 'flight': {
      // Flight pricing: fixed airport security & handling fees + distance flight cost
      const airportTaxes = 38;
      const flightDistanceCost = distanceKm * 0.065;
      const roundedTotal = Math.max(49, Math.round(airportTaxes + flightDistanceCost));
      baseFare = roundedTotal - airportTaxes;
      taxesOrTolls = airportTaxes;
      details = `Vol direct classe économique incluant taxes d'aéroport, bagage cabine et accès aux terminaux`;
      return { totalEuro: roundedTotal, baseFare, taxesOrTolls, details };
    }

    case 'boat': {
      // Ferry pricing
      const roundedTotal = Math.max(35, Math.round(25 + distanceKm * 0.11));
      baseFare = Math.round(roundedTotal * 0.85);
      taxesOrTolls = roundedTotal - baseFare;
      details = `Place passager pont avec accès aux espaces de restauration et salle de prière à bord`;
      return { totalEuro: roundedTotal, baseFare, taxesOrTolls, details };
    }
  }
}

/**
 * Main Algorithm: Generates all realistic transport ticket options,
 * checks every salât time, computes costs & durations, and orders them by cost.
 */
export function generateRouteTicketOptions(params: AlgorithmParams): TravelTicketOption[] {
  const {
    origin,
    destination,
    travelDate,
    departureTime,
    calculationMethod = 'Muslim World League',
    asrMethod = 'standard',
    allowedModes = ['car', 'train', 'flight', 'boat'],
    sortBy = 'cost',
  } = params;

  const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const isEligibleForQasr = isTravelDistanceEligible(distanceKm);

  // Parse departure time
  const [depH, depM] = departureTime.split(':').map(Number);

  // Compute astronomical prayers for origin location
  const prayerCalc = computePrayersForLocation(
    origin.lat,
    origin.lng,
    new Date(travelDate),
    calculationMethod,
    asrMethod
  );

  const prayerTimesMap: Record<string, string> = {
    Fajr: prayerCalc.times.fajr,
    Sunrise: prayerCalc.times.sunrise,
    Dhuhr: prayerCalc.times.dhuhr,
    Asr: prayerCalc.times.asr,
    Maghrib: prayerCalc.times.maghrib,
    Isha: prayerCalc.times.isha,
  };

  const tickets: TravelTicketOption[] = [];

  // Determine which modes are geographically sensible
  const isSeaCrossing =
    (origin.type === 'port' || destination.type === 'port') ||
    (origin.country !== destination.country && (origin.country === 'Algérie' || destination.country === 'Algérie' || origin.country === 'Maroc' || destination.country === 'Maroc'));

  // 1. CAR / COVOITURAGE OPTION
  if (allowedModes.includes('car') && distanceKm <= 1500) {
    const avgCarSpeed = 98; // km/h
    // Include 25 min pause for every 3.5 hours of driving
    const pausesNeeded = Math.floor(distanceKm / 350);
    const drivingHours = distanceKm / avgCarSpeed;
    const totalDurationHours = Math.round((drivingHours + pausesNeeded * 0.45) * 10) / 10;

    const totalDepMinutes = depH * 60 + depM;
    const totalArrMinutes = totalDepMinutes + Math.round(totalDurationHours * 60);
    const arrH = Math.floor(totalArrMinutes / 60) % 24;
    const arrM = totalArrMinutes % 60;
    const arrTimeStr = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    const cost = calculateEstimatedCost('car', distanceKm);
    const salatAnalysis = analyzeSalatSchedule(
      depH,
      depM,
      arrH,
      arrM,
      'car',
      prayerTimesMap,
      isEligibleForQasr,
      origin.name,
      destination.name,
      prayerCalc.qiblaBearing
    );

    const segment: TravelSegment = {
      id: `seg-car-${Date.now()}`,
      transportMode: 'car',
      from: origin,
      to: destination,
      departureTime,
      arrivalTime: arrTimeStr,
      distanceKm,
      prayerStops: salatAnalysis.prayerStops,
      enRoutePrayers: salatAnalysis.enRoutePrayers,
      travelTips: "Contrôle total sur vos arrêts. Faites vos ablutions sur les aires d'autoroutes équipées.",
    };

    const itinerary: TravelItinerary = {
      id: `itin-car-${Date.now()}`,
      title: `${origin.name} ➔ ${destination.name} (Voiture / Autoroute)`,
      travelDate,
      calculationMethod,
      asrMethod,
      origin,
      destination,
      totalDistanceKm: distanceKm,
      totalDurationHours,
      isTravelerConcessionApplicable: isEligibleForQasr,
      rukhsahDetails: {
        qasrActive: isEligibleForQasr,
        jamActive: isEligibleForQasr,
        recommendation: salatAnalysis.rukhsahAdvice,
      },
      segments: [segment],
      notes: `Trajet autoroutier avec haltes prière programmées. Coût estimé à ${cost.totalEuro}€.`,
    };

    tickets.push({
      id: `ticket-car-${Date.now()}`,
      transportMode: 'car',
      providerName: 'Voiture / Covoiturage & Autoroute',
      ticketCode: 'A-ROUTE',
      priceEstimateEuro: cost.totalEuro,
      priceBreakdown: cost,
      departureTime,
      arrivalTime: arrTimeStr,
      durationHours: totalDurationHours,
      formattedDuration: formatDuration(totalDurationHours),
      distanceKm,
      salatScore: salatAnalysis.salatScore,
      salatCompatibilityLabel: salatAnalysis.salatCompatibilityLabel,
      prayersChecked: salatAnalysis.prayersChecked,
      salatHighlights: salatAnalysis.salatHighlights,
      rukhsahAdvice: salatAnalysis.rukhsahAdvice,
      itinerary,
    });
  }

  // 2. TRAIN OPTION (TGV / Express)
  if (allowedModes.includes('train') && distanceKm <= 1200) {
    const avgTrainSpeed = distanceKm > 200 ? 210 : 130; // km/h
    const trainHours = Math.round((distanceKm / avgTrainSpeed + 0.4) * 10) / 10;

    const totalDepMinutes = depH * 60 + depM;
    const totalArrMinutes = totalDepMinutes + Math.round(trainHours * 60);
    const arrH = Math.floor(totalArrMinutes / 60) % 24;
    const arrM = totalArrMinutes % 60;
    const arrTimeStr = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    const cost = calculateEstimatedCost('train', distanceKm);
    const salatAnalysis = analyzeSalatSchedule(
      depH,
      depM,
      arrH,
      arrM,
      'train',
      prayerTimesMap,
      isEligibleForQasr,
      origin.name,
      destination.name,
      prayerCalc.qiblaBearing
    );

    const segment: TravelSegment = {
      id: `seg-train-${Date.now()}`,
      transportMode: 'train',
      from: origin,
      to: destination,
      departureTime,
      arrivalTime: arrTimeStr,
      distanceKm,
      flightOrTrainNumber: `TGV ${Math.floor(6000 + Math.random() * 800)}`,
      prayerStops: salatAnalysis.prayerStops,
      enRoutePrayers: salatAnalysis.enRoutePrayers,
      travelTips: "Espaces calmes en gare et sur plateformes. Mash sur chaussettes recommandé pour ablutions sans éclaboussures.",
    };

    const itinerary: TravelItinerary = {
      id: `itin-train-${Date.now()}`,
      title: `${origin.name} ➔ ${destination.name} (TGV Express)`,
      travelDate,
      calculationMethod,
      asrMethod,
      origin,
      destination,
      totalDistanceKm: distanceKm,
      totalDurationHours: trainHours,
      isTravelerConcessionApplicable: isEligibleForQasr,
      rukhsahDetails: {
        qasrActive: isEligibleForQasr,
        jamActive: isEligibleForQasr,
        recommendation: salatAnalysis.rukhsahAdvice,
      },
      segments: [segment],
      notes: `Trajet ferroviaire rapide. Billet estimé à ${cost.totalEuro}€.`,
    };

    tickets.push({
      id: `ticket-train-${Date.now()}`,
      transportMode: 'train',
      providerName: 'TGV INOUI / Train Express',
      ticketCode: segment.flightOrTrainNumber || 'TGV 6420',
      priceEstimateEuro: cost.totalEuro,
      priceBreakdown: cost,
      departureTime,
      arrivalTime: arrTimeStr,
      durationHours: trainHours,
      formattedDuration: formatDuration(trainHours),
      distanceKm,
      salatScore: salatAnalysis.salatScore,
      salatCompatibilityLabel: salatAnalysis.salatCompatibilityLabel,
      prayersChecked: salatAnalysis.prayersChecked,
      salatHighlights: salatAnalysis.salatHighlights,
      rukhsahAdvice: salatAnalysis.rukhsahAdvice,
      itinerary,
    });
  }

  // 3. FLIGHT OPTION
  if (allowedModes.includes('flight') && distanceKm >= 250) {
    const flightCruisingSpeed = 750; // km/h
    // Flight time + 2h pre-boarding / airport checks
    const flightAirHours = distanceKm / flightCruisingSpeed;
    const totalFlightHours = Math.round((flightAirHours + 2.0) * 10) / 10;

    const totalDepMinutes = depH * 60 + depM;
    const totalArrMinutes = totalDepMinutes + Math.round(totalFlightHours * 60);
    const arrH = Math.floor(totalArrMinutes / 60) % 24;
    const arrM = totalArrMinutes % 60;
    const arrTimeStr = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    const cost = calculateEstimatedCost('flight', distanceKm);
    const salatAnalysis = analyzeSalatSchedule(
      depH,
      depM,
      arrH,
      arrM,
      'flight',
      prayerTimesMap,
      isEligibleForQasr,
      origin.name,
      destination.name,
      prayerCalc.qiblaBearing
    );

    const segment: TravelSegment = {
      id: `seg-flight-${Date.now()}`,
      transportMode: 'flight',
      from: origin,
      to: destination,
      departureTime,
      arrivalTime: arrTimeStr,
      distanceKm,
      flightOrTrainNumber: `AF ${Math.floor(1000 + Math.random() * 8000)}`,
      prayerStops: salatAnalysis.prayerStops,
      enRoutePrayers: salatAnalysis.enRoutePrayers,
      travelTips: "Profitez des salles de prière multiconfessionnelles des aéroports avant de passer les portes d'embarquement.",
    };

    const itinerary: TravelItinerary = {
      id: `itin-flight-${Date.now()}`,
      title: `${origin.name} ➔ ${destination.name} (Vol Aérien Direct)`,
      travelDate,
      calculationMethod,
      asrMethod,
      origin,
      destination,
      totalDistanceKm: distanceKm,
      totalDurationHours: totalFlightHours,
      isTravelerConcessionApplicable: isEligibleForQasr,
      rukhsahDetails: {
        qasrActive: isEligibleForQasr,
        jamActive: isEligibleForQasr,
        recommendation: salatAnalysis.rukhsahAdvice,
      },
      segments: [segment],
      notes: `Liaison aérienne. Billet d'avion estimé à ${cost.totalEuro}€.`,
    };

    tickets.push({
      id: `ticket-flight-${Date.now()}`,
      transportMode: 'flight',
      providerName: 'Vol Direct Économique',
      ticketCode: segment.flightOrTrainNumber || 'AF 7624',
      priceEstimateEuro: cost.totalEuro,
      priceBreakdown: cost,
      departureTime,
      arrivalTime: arrTimeStr,
      durationHours: totalFlightHours,
      formattedDuration: formatDuration(totalFlightHours),
      distanceKm,
      salatScore: salatAnalysis.salatScore,
      salatCompatibilityLabel: salatAnalysis.salatCompatibilityLabel,
      prayersChecked: salatAnalysis.prayersChecked,
      salatHighlights: salatAnalysis.salatHighlights,
      rukhsahAdvice: salatAnalysis.rukhsahAdvice,
      itinerary,
    });
  }

  // 4. BOAT / FERRY OPTION (if applicable or requested)
  if (allowedModes.includes('boat') && (isSeaCrossing || distanceKm > 300)) {
    const avgFerrySpeed = 38; // km/h
    const ferryHours = Math.round((distanceKm / avgFerrySpeed + 1.2) * 10) / 10;

    const totalDepMinutes = depH * 60 + depM;
    const totalArrMinutes = totalDepMinutes + Math.round(ferryHours * 60);
    const arrH = Math.floor(totalArrMinutes / 60) % 24;
    const arrM = totalArrMinutes % 60;
    const arrTimeStr = `${arrH.toString().padStart(2, '0')}:${arrM.toString().padStart(2, '0')}`;

    const cost = calculateEstimatedCost('boat', distanceKm);
    const salatAnalysis = analyzeSalatSchedule(
      depH,
      depM,
      arrH,
      arrM,
      'boat',
      prayerTimesMap,
      isEligibleForQasr,
      origin.name,
      destination.name,
      prayerCalc.qiblaBearing
    );

    const segment: TravelSegment = {
      id: `seg-boat-${Date.now()}`,
      transportMode: 'boat',
      from: origin,
      to: destination,
      departureTime,
      arrivalTime: arrTimeStr,
      distanceKm,
      flightOrTrainNumber: 'FERRY-LINE',
      prayerStops: salatAnalysis.prayerStops,
      enRoutePrayers: salatAnalysis.enRoutePrayers,
      travelTips: "Salle de prière dédiée accessible à bord. Coucher du soleil visible depuis le pont pour le Maghrib.",
    };

    const itinerary: TravelItinerary = {
      id: `itin-boat-${Date.now()}`,
      title: `${origin.name} ➔ ${destination.name} (Traversée Maritime Ferry)`,
      travelDate,
      calculationMethod,
      asrMethod,
      origin,
      destination,
      totalDistanceKm: distanceKm,
      totalDurationHours: ferryHours,
      isTravelerConcessionApplicable: isEligibleForQasr,
      rukhsahDetails: {
        qasrActive: isEligibleForQasr,
        jamActive: isEligibleForQasr,
        recommendation: salatAnalysis.rukhsahAdvice,
      },
      segments: [segment],
      notes: `Traversée maritime avec salle de prière à bord. Billet estimé à ${cost.totalEuro}€.`,
    };

    tickets.push({
      id: `ticket-boat-${Date.now()}`,
      transportMode: 'boat',
      providerName: 'Ferry Maritime Express',
      ticketCode: 'FERRY-M1',
      priceEstimateEuro: cost.totalEuro,
      priceBreakdown: cost,
      departureTime,
      arrivalTime: arrTimeStr,
      durationHours: ferryHours,
      formattedDuration: formatDuration(ferryHours),
      distanceKm,
      salatScore: salatAnalysis.salatScore,
      salatCompatibilityLabel: salatAnalysis.salatCompatibilityLabel,
      prayersChecked: salatAnalysis.prayersChecked,
      salatHighlights: salatAnalysis.salatHighlights,
      rukhsahAdvice: salatAnalysis.rukhsahAdvice,
      itinerary,
    });
  }

  // If no tickets generated (e.g. strict filters), guarantee at least Train and Car
  if (tickets.length === 0) {
    // Re-run with default modes
    return generateRouteTicketOptions({
      ...params,
      allowedModes: ['car', 'train'],
    });
  }

  // ORDERING ALGORITHM:
  // Sort by cost (ascending) by default as requested: "order them by cost"
  tickets.sort((a, b) => {
    if (sortBy === 'duration') {
      return a.durationHours - b.durationHours;
    }
    if (sortBy === 'salat') {
      return b.salatScore - a.salatScore;
    }
    // Default: 'cost'
    return a.priceEstimateEuro - b.priceEstimateEuro;
  });

  return tickets;
}
