import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  CalculationParameters,
  Qibla,
  Madhab,
} from 'adhan';
import { PrayerScheduleItem, PrayerName } from '../types';

export interface CalculationMethodOption {
  id: string;
  name: string;
  description: string;
  getMethodParams: () => CalculationParameters;
}

export const CALCULATION_METHODS: CalculationMethodOption[] = [
  {
    id: 'MWL',
    name: 'Ligue Islamique Mondiale (MWL)',
    description: 'Fajr 18°, Isha 17° - Recommandé pour l\'Europe et l\'Asie',
    getMethodParams: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'UOIF',
    name: 'France (Angle 12° / UOIF)',
    description: 'Fajr 12°, Isha 12° - Adapté aux latitudes de France',
    getMethodParams: () => {
      const params = CalculationMethod.MuslimWorldLeague();
      params.fajrAngle = 12;
      params.ishaAngle = 12;
      return params;
    },
  },
  {
    id: 'EGYPT',
    name: 'Autorité Égyptienne (EGAS)',
    description: 'Fajr 19.5°, Isha 17.5° - Afrique du Nord et Moyen-Orient',
    getMethodParams: () => CalculationMethod.Egyptian(),
  },
  {
    id: 'MAKKAH',
    name: 'Oumm Al Qura (La Mecque)',
    description: 'Fajr 18.5°, Isha 90 min après Maghrib (Arabie Saoudite & Golfe)',
    getMethodParams: () => CalculationMethod.UmmAlQura(),
  },
  {
    id: 'ISNA',
    name: 'ISNA (Amérique du Nord)',
    description: 'Fajr 15°, Isha 15° - États-Unis et Canada',
    getMethodParams: () => CalculationMethod.NorthAmerica(),
  },
  {
    id: 'KARACHI',
    name: 'Université de Karachi',
    description: 'Fajr 18°, Isha 18° - Pakistan, Inde, Bangladesh',
    getMethodParams: () => CalculationMethod.Karachi(),
  },
];

export function getCalculationParameters(
  methodId: string,
  asrMethod: 'standard' | 'hanafi' = 'standard'
): CalculationParameters {
  const selected = CALCULATION_METHODS.find((m) => m.id === methodId) || CALCULATION_METHODS[0];
  const params = selected.getMethodParams();
  if (asrMethod === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }
  return params;
}

export function formatTime(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function computePrayersForLocation(
  lat: number,
  lng: number,
  date: Date = new Date(),
  methodId: string = 'MWL',
  asrMethod: 'standard' | 'hanafi' = 'standard'
): {
  prayers: PrayerScheduleItem[];
  qiblaBearing: number;
} {
  const coordinates = new Coordinates(lat, lng);
  const params = getCalculationParameters(methodId, asrMethod);
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const qiblaBearing = Math.round(Qibla(coordinates));

  const items: PrayerScheduleItem[] = [
    {
      id: 'fajr',
      name: 'Fajr',
      labelFr: 'Al-Fajr (Aube)',
      arabicName: 'الفجر',
      time: formatTime(prayerTimes.fajr),
      timestamp: prayerTimes.fajr.getTime(),
      isQasrEligible: false,
      rakahsNormal: 2,
      rakahsTravel: 2,
    },
    {
      id: 'sunrise',
      name: 'Sunrise',
      labelFr: 'Chourouk (Lever du soleil)',
      arabicName: 'الشروق',
      time: formatTime(prayerTimes.sunrise),
      timestamp: prayerTimes.sunrise.getTime(),
      isQasrEligible: false,
      rakahsNormal: 0,
      rakahsTravel: 0,
    },
    {
      id: 'dhuhr',
      name: 'Dhuhr',
      labelFr: 'Ad-Dhuhr (Midi solaire)',
      arabicName: 'الظهر',
      time: formatTime(prayerTimes.dhuhr),
      timestamp: prayerTimes.dhuhr.getTime(),
      isQasrEligible: true,
      rakahsNormal: 4,
      rakahsTravel: 2,
      canCombineWith: 'Asr',
    },
    {
      id: 'asr',
      name: 'Asr',
      labelFr: 'Al-Asr (Après-midi)',
      arabicName: 'العصر',
      time: formatTime(prayerTimes.asr),
      timestamp: prayerTimes.asr.getTime(),
      isQasrEligible: true,
      rakahsNormal: 4,
      rakahsTravel: 2,
      canCombineWith: 'Dhuhr',
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      labelFr: 'Al-Maghrib (Coucher du soleil)',
      arabicName: 'المغرب',
      time: formatTime(prayerTimes.maghrib),
      timestamp: prayerTimes.maghrib.getTime(),
      isQasrEligible: false,
      rakahsNormal: 3,
      rakahsTravel: 3,
      canCombineWith: 'Isha',
    },
    {
      id: 'isha',
      name: 'Isha',
      labelFr: 'Al-Isha (Nuit)',
      arabicName: 'العشاء',
      time: formatTime(prayerTimes.isha),
      timestamp: prayerTimes.isha.getTime(),
      isQasrEligible: true,
      rakahsNormal: 4,
      rakahsTravel: 2,
      canCombineWith: 'Maghrib',
    },
  ];

  return {
    prayers: items,
    qiblaBearing,
  };
}

// Compute distance in kilometers between two geo coordinates (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Check traveler status (Fiqh consensus: ~80km+ travel constitutes Safar)
export function isTravelDistanceEligible(distanceKm: number): boolean {
  return distanceKm >= 80;
}
