export type TransportMode = 'flight' | 'train' | 'boat' | 'car';

export interface GeoLocation {
  name: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  timezone?: string;
  type?: 'airport' | 'station' | 'port' | 'city' | 'rest_stop';
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerScheduleItem {
  id: string;
  name: PrayerName;
  labelFr: string;
  arabicName: string;
  time: string; // "HH:mm"
  timestamp: number; // unix ms
  isQasrEligible: boolean; // Dhuhr, Asr, Isha can be shortened to 2 rak'ahs
  rakahsNormal: number;
  rakahsTravel: number;
  canCombineWith?: PrayerName; // Dhuhr with Asr, Maghrib with Isha
  status?: 'pending' | 'completed' | 'combined' | 'in_transit';
}

export interface PrayerStopRecommendation {
  id: string;
  prayerName: PrayerName;
  recommendedTime: string;
  locationName: string;
  locationType: 'airport_prayer_room' | 'train_station' | 'highway_rest_area' | 'mosque' | 'onboard';
  suggestedDurationMinutes: number;
  fiqhAdvice: string;
  qiblaBearing: number; // degrees from North
}

export interface TravelSegment {
  id: string;
  transportMode: TransportMode;
  from: GeoLocation;
  to: GeoLocation;
  departureTime: string; // ISO or "YYYY-MM-DDTHH:mm"
  arrivalTime: string;
  flightOrTrainNumber?: string;
  distanceKm: number;
  prayerStops: PrayerStopRecommendation[];
  enRoutePrayers: PrayerName[];
  travelTips?: string;
}

export interface TravelItinerary {
  id: string;
  title: string;
  origin: GeoLocation;
  destination: GeoLocation;
  travelDate: string; // "YYYY-MM-DD"
  calculationMethod: string;
  asrMethod: 'standard' | 'hanafi';
  segments: TravelSegment[];
  totalDistanceKm: number;
  totalDurationHours: number;
  isTravelerConcessionApplicable: boolean; // >= 80km
  rukhsahDetails: {
    qasrActive: boolean;
    jamActive: boolean;
    recommendation: string;
  };
  notes?: string;
}

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  airportCode?: string;
  stationName?: string;
  portName?: string;
}

export interface FiqhGuideItem {
  id: string;
  title: string;
  category: 'qasr' | 'jam' | 'wudu' | 'qibla' | 'onboard' | 'distance';
  badge: string;
  summary: string;
  content: string;
  hadithOrDalil?: string;
}

export interface TravelTicketOption {
  id: string;
  transportMode: TransportMode;
  providerName: string;
  ticketCode: string;
  priceEstimateEuro: number;
  priceBreakdown: {
    baseFare: number;
    taxesOrTolls: number;
    details: string;
  };
  departureTime: string;
  arrivalTime: string;
  durationHours: number;
  formattedDuration: string;
  distanceKm: number;
  salatScore: number; // 0 - 100
  salatCompatibilityLabel: 'Excellente' | 'Très Bonne' | 'Modérée';
  prayersChecked: {
    name: PrayerName;
    status: 'prayed_before_departure' | 'stop_en_route' | 'prayed_at_arrival' | 'onboard';
    time: string;
    locationDesc: string;
  }[];
  salatHighlights: string[];
  rukhsahAdvice: string;
  itinerary: TravelItinerary;
}

export interface RouteComparisonResult {
  origin: GeoLocation;
  destination: GeoLocation;
  travelDate: string;
  totalDistanceKm: number;
  tickets: TravelTicketOption[];
  sortedBy: 'cost' | 'duration' | 'salat';
}
