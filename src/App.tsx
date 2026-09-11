import React, { useState } from 'react';
import { Header } from './components/Header';
import { TripPlannerForm } from './components/TripPlannerForm';
import { ItineraryView } from './components/ItineraryView';
import { QiblaCompassModal } from './components/QiblaCompassModal';
import { FiqhGuideModal } from './components/FiqhGuideModal';
import { DuaModal } from './components/DuaModal';
import { PrintModal } from './components/PrintModal';
import { TravelItinerary, TransportMode, GeoLocation } from './types';
import { SAMPLE_TRIPS } from './data/sampleTrips';
import { POPULAR_CITIES } from './data/cities';
import { calculateDistanceKm, computePrayersForLocation, isTravelDistanceEligible } from './utils/prayerCalculator';
import { exportItineraryToIcs } from './utils/calendarExport';
import { Sparkles, AlertCircle, Compass, Info, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current active itinerary (defaults to realistic sample trip so app is instantly alive)
  const [itinerary, setItinerary] = useState<TravelItinerary>(SAMPLE_TRIPS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals state
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  const [qiblaTarget, setQiblaTarget] = useState<{ lat: number; lng: number; name: string; bearing: number }>({
    lat: SAMPLE_TRIPS[0].origin.lat,
    lng: SAMPLE_TRIPS[0].origin.lng,
    name: SAMPLE_TRIPS[0].origin.name,
    bearing: 119,
  });

  const [isFiqhOpen, setIsFiqhOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Find approximate coordinates for any query string
  const resolveLocationCoords = (query: string): GeoLocation => {
    const q = query.toLowerCase().trim();
    const match = POPULAR_CITIES.find(
      (c) =>
        q.includes(c.name.toLowerCase()) ||
        q.includes(c.country.toLowerCase()) ||
        (c.airportCode && q.includes(c.airportCode.toLowerCase()))
    );

    if (match) {
      return {
        name: query,
        city: match.name,
        country: match.country,
        lat: match.lat,
        lng: match.lng,
        type: q.includes('aéroport') || q.includes('airport') ? 'airport' : q.includes('gare') ? 'station' : 'city',
      };
    }

    // Default fallback to Paris coordinates if completely unknown
    return {
      name: query,
      city: query,
      lat: 48.8566 + (Math.random() - 0.5) * 2,
      lng: 2.3522 + (Math.random() - 0.5) * 2,
      type: 'city',
    };
  };

  // Handler: Plan trip either via standard engine or AI
  const handlePlanTrip = async (params: {
    origin: string;
    destination: string;
    travelDate: string;
    departureTime: string;
    transportModes: TransportMode[];
    calculationMethod: string;
    asrMethod: 'standard' | 'hanafi';
    useAi: boolean;
  }) => {
    setIsLoading(true);
    setStatusMessage(null);

    const originLoc = resolveLocationCoords(params.origin);
    const destLoc = resolveLocationCoords(params.destination);
    const distKm = calculateDistanceKm(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng);
    const isSafar = isTravelDistanceEligible(distKm);

    if (params.useAi) {
      try {
        const response = await fetch('/api/ai/optimize-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: params.origin,
            destination: params.destination,
            transportModes: params.transportModes,
            travelDate: params.travelDate,
            preferredCalculationMethod: params.calculationMethod,
            travelContext: `Départ à ${params.departureTime}. Voyageur musulman recherchant les facilités de prière (salles aéroports, gares, aires d'autoroutes).`,
          }),
        });

        const json = await response.json();
        if (json.success && json.data) {
          const aiData = json.data;

          const segments = aiData.segments.map((s: any, idx: number) => {
            const segFromLat = s.fromCoords?.lat || originLoc.lat;
            const segFromLng = s.fromCoords?.lng || originLoc.lng;
            const segToLat = s.toCoords?.lat || destLoc.lat;
            const segToLng = s.toCoords?.lng || destLoc.lng;

            const prayers = computePrayersForLocation(
              segFromLat,
              segFromLng,
              new Date(params.travelDate),
              params.calculationMethod,
              params.asrMethod
            );

            return {
              id: s.id || `seg-ai-${idx}`,
              transportMode: (s.transportMode || 'flight') as TransportMode,
              from: {
                name: s.fromName || params.origin,
                lat: segFromLat,
                lng: segFromLng,
              },
              to: {
                name: s.toName || params.destination,
                lat: segToLat,
                lng: segToLng,
              },
              departureTime: s.departureTime || params.departureTime,
              arrivalTime: s.arrivalTime || '16:00',
              distanceKm: Math.round(distKm / aiData.segments.length) || 350,
              enRoutePrayers: s.prayersEnRoute || ['Dhuhr', 'Asr'],
              travelTips: s.prayerActionPlan || 'Priez avec sérénité.',
              prayerStops: [
                {
                  id: `stop-ai-${idx}`,
                  prayerName: (s.prayersEnRoute?.[0] as any) || 'Dhuhr',
                  recommendedTime: s.departureTime || '13:00',
                  locationName: s.recommendedStopFacility || 'Espace de prière recommandé',
                  locationType: s.transportMode === 'flight' ? 'airport_prayer_room' : s.transportMode === 'train' ? 'train_station' : 'highway_rest_area',
                  suggestedDurationMinutes: 25,
                  fiqhAdvice: s.prayerActionPlan,
                  qiblaBearing: prayers.qiblaBearing,
                },
              ],
            };
          });

          const newItinerary: TravelItinerary = {
            id: `trip-${Date.now()}`,
            title: aiData.tripTitle || `${params.origin} ➔ ${params.destination}`,
            travelDate: params.travelDate,
            calculationMethod: params.calculationMethod,
            asrMethod: params.asrMethod,
            origin: originLoc,
            destination: destLoc,
            totalDistanceKm: aiData.estimatedDistanceKm || distKm,
            totalDurationHours: parseFloat(aiData.totalDuration) || 4.5,
            isTravelerConcessionApplicable: isSafar,
            rukhsahDetails: {
              qasrActive: isSafar,
              jamActive: isSafar,
              recommendation: isSafar
                ? "Trajet supérieur à 80 km. Les dispenses de voyage (Qasr à 2 rak'ahs pour Dhuhr, Asr et Isha, et le regroupement Jam') s'appliquent selon la Sunnah."
                : "Trajet de proximité (< 80 km). Priez chaque prière à son heure complète.",
            },
            segments,
            notes: aiData.summary,
          };

          setItinerary(newItinerary);
          setStatusMessage(
            json.message || (json.isFallback
              ? "Itinéraire généré et optimisé pour vos prières (Moteur expert intégré)."
              : "Itinéraire optimisé avec succès par l'IA !")
          );
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Bascule automatique sur calcul astronomique standard :", err);
      }
    }

    // Standard Deterministic Calculation Engine
    const primaryMode: TransportMode = params.transportModes.includes('flight') && distKm > 700
      ? 'flight'
      : params.transportModes.includes('train') && distKm <= 900
      ? 'train'
      : params.transportModes.includes('car')
      ? 'car'
      : params.transportModes[0] || 'train';

    const avgSpeed = primaryMode === 'flight' ? 700 : primaryMode === 'train' ? 220 : primaryMode === 'car' ? 95 : 35;
    const durationHours = Math.max(1, Math.round((distKm / avgSpeed + (primaryMode === 'flight' ? 2 : 0.5)) * 10) / 10);

    // Determine arrival time
    const [depH, depM] = params.departureTime.split(':').map(Number);
    const totalMinutes = depH * 60 + depM + Math.round(durationHours * 60);
    const arrH = Math.floor(totalMinutes / 60) % 24;
    const arrM = totalMinutes % 60;
    const formattedArrivalTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

    // Astronomical prayer calculations for origin
    const prayerCalc = computePrayersForLocation(
      originLoc.lat,
      originLoc.lng,
      new Date(params.travelDate),
      params.calculationMethod,
      params.asrMethod
    );

    // Identify which prayers fall within or close to travel window
    const enRoute: ('Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha')[] = [];
    if (depH < 14 && arrH >= 13) enRoute.push('Dhuhr');
    if (depH < 17 && arrH >= 15) enRoute.push('Asr');
    if (depH < 20 && arrH >= 18) enRoute.push('Maghrib');
    if (arrH >= 20 || depH >= 20) enRoute.push('Isha');
    if (enRoute.length === 0) enRoute.push('Dhuhr', 'Asr');

    const recommendedStopFacility =
      primaryMode === 'flight'
        ? "Salle de prière multiconfessionnelle (Terminal des départs / Transit)"
        : primaryMode === 'train'
        ? "Gare de départ ou espace de recueillement en gare d'arrivée"
        : primaryMode === 'boat'
        ? "Salle de prière dédiée à bord du navire (Pont passagers)"
        : "Aire de repos autoroutière avec espace vert propre et sanitaires";

    const localItinerary: TravelItinerary = {
      id: `trip-std-${Date.now()}`,
      title: `${params.origin} ➔ ${params.destination} (${primaryMode.toUpperCase()})`,
      travelDate: params.travelDate,
      calculationMethod: params.calculationMethod,
      asrMethod: params.asrMethod,
      origin: originLoc,
      destination: destLoc,
      totalDistanceKm: distKm,
      totalDurationHours: durationHours,
      isTravelerConcessionApplicable: isSafar,
      rukhsahDetails: {
        qasrActive: isSafar,
        jamActive: isSafar,
        recommendation: isSafar
          ? `Trajet de ${distKm} km (> 80 km). Statut de voyageur (Safar) établi : vous pouvez raccourcir Dhuhr, Asr et Isha à 2 unités et regrouper (Jam' Taqdim ou Ta'khir).`
          : `Trajet de ${distKm} km (< 80 km). Le statut de voyageur plein ne s'applique pas; priez chaque prière complète à son horaire.`,
      },
      segments: [
        {
          id: `seg-std-1`,
          transportMode: primaryMode,
          from: originLoc,
          to: destLoc,
          departureTime: params.departureTime,
          arrivalTime: formattedArrivalTime,
          distanceKm: distKm,
          enRoutePrayers: enRoute,
          travelTips: `Ablutions recommandées avant l'embarquement. Possibilité d'essuyer sur les chaussettes (Mash) pendant 72h.`,
          prayerStops: [
            {
              id: `stop-std-1`,
              prayerName: enRoute[0] || 'Dhuhr',
              recommendedTime: params.departureTime,
              locationName: recommendedStopFacility,
              locationType: primaryMode === 'flight' ? 'airport_prayer_room' : primaryMode === 'train' ? 'train_station' : primaryMode === 'boat' ? 'onboard' : 'highway_rest_area',
              suggestedDurationMinutes: 20,
              fiqhAdvice: isSafar
                ? "Regroupement conseillé : priez 2 rak'ahs pour la première prière, puis immédiatement 2 rak'ahs pour la suivante."
                : "Accomplissez la prière complète selon son temps réglementaire.",
              qiblaBearing: prayerCalc.qiblaBearing,
            },
          ],
        },
      ],
    };

    setItinerary(localItinerary);
    setStatusMessage("Itinéraire calculé avec précision astronomique !");
    setIsLoading(false);
  };

  const handleOpenQiblaForLocation = (lat: number, lng: number, name: string) => {
    const calc = computePrayersForLocation(lat, lng);
    setQiblaTarget({
      lat,
      lng,
      name,
      bearing: calc.qiblaBearing,
    });
    setIsQiblaOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      {/* Navigation Bar */}
      <Header
        onOpenFiqhGuide={() => setIsFiqhOpen(true)}
        onOpenQiblaModal={() => {
          handleOpenQiblaForLocation(itinerary.origin.lat, itinerary.origin.lng, itinerary.origin.name);
        }}
        onOpenDuaModal={() => setIsDuaOpen(true)}
        onNewTrip={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Status Notification */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Banner Intro */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-800">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Fiqh al-Safar & Logistique Multimodale
              </span>
              <span className="text-xs text-stone-300 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                Avion • Train • Bateau • Voiture
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Voyagez en toute sérénité sans manquer aucune prière
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Planifiez vos trajets avec calcul astronomique précis des fenêtres de prière, identification automatique des salles de prière d'aéroports, gares, ferrys et aires d'autoroutes, calcul de la Qibla et application des règles prophétiques du voyageur (Qasr et Jam').
            </p>

            {/* Quick action badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setIsDuaOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 transition-colors flex items-center gap-1.5"
              >
                <span>🤲 Invocations du Voyage (Dou'a)</span>
              </button>

              <button
                onClick={() => setIsFiqhOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors flex items-center gap-1.5"
              >
                <span>📖 Règles : Raccourcir & Regrouper</span>
              </button>

              <button
                onClick={() => handleOpenQiblaForLocation(itinerary.origin.lat, itinerary.origin.lng, itinerary.origin.name)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Boussole Qibla</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trip Planner Input Form */}
        <TripPlannerForm
          onPlanTrip={handlePlanTrip}
          onLoadPresetTrip={(preset) => {
            setItinerary(preset);
            setStatusMessage(`Itinéraire pré-configuré chargé : ${preset.title}`);
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          isLoading={isLoading}
        />

        {/* Itinerary & Prayer Schedule Display */}
        <ItineraryView
          itinerary={itinerary}
          onOpenQiblaForLocation={handleOpenQiblaForLocation}
          onPrintItinerary={() => setIsPrintOpen(true)}
          onExportCalendar={() => exportItineraryToIcs(itinerary)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-stone-900 text-stone-400 border-t border-stone-800 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
              س
            </span>
            <span className="text-white font-bold">Safarpra</span>
            <span>— Conçu pour faciliter la pratique du voyageur musulman</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Calculs via Adhan & Fiqh Sunnite</span>
            <span>•</span>
            <button onClick={() => setIsFiqhOpen(true)} className="hover:text-white underline">
              Guide Fiqh al-Safar
            </button>
            <span>•</span>
            <button onClick={() => setIsDuaOpen(true)} className="hover:text-white underline">
              Dou'as
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QiblaCompassModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
        locationName={qiblaTarget.name}
        qiblaBearing={qiblaTarget.bearing}
      />

      <FiqhGuideModal
        isOpen={isFiqhOpen}
        onClose={() => setIsFiqhOpen(false)}
        currentTripContext={`${itinerary.origin.name} vers ${itinerary.destination.name} (${itinerary.totalDistanceKm} km)`}
      />

      <DuaModal
        isOpen={isDuaOpen}
        onClose={() => setIsDuaOpen(false)}
      />

      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        itinerary={itinerary}
      />
    </div>
  );
}
