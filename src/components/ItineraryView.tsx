import React, { useState } from 'react';
import { 
  Plane, Train, Ship, Car, CheckCircle2, Clock, MapPin, 
  Compass, AlertCircle, Share2, Printer, Calendar, ShieldCheck, 
  Sparkles, Info, Check, ArrowRight, ExternalLink 
} from 'lucide-react';
import { TravelItinerary, TravelSegment, PrayerStopRecommendation, TransportMode } from '../types';
import { computePrayersForLocation } from '../utils/prayerCalculator';

interface ItineraryViewProps {
  itinerary: TravelItinerary;
  onOpenQiblaForLocation: (lat: number, lng: number, name: string) => void;
  onPrintItinerary: () => void;
  onExportCalendar: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onOpenQiblaForLocation,
  onPrintItinerary,
  onExportCalendar,
}) => {
  // Local state to keep track of completed or checked prayers during this trip
  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>({});

  const togglePrayerDone = (key: string) => {
    setCompletedPrayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-5 h-5 text-sky-600" />;
      case 'train':
        return <Train className="w-5 h-5 text-emerald-600" />;
      case 'boat':
        return <Ship className="w-5 h-5 text-amber-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-rose-600" />;
    }
  };

  const getTransportLabel = (mode: TransportMode) => {
    switch (mode) {
      case 'flight':
        return 'Avion';
      case 'train':
        return 'Train';
      case 'boat':
        return 'Bateau / Ferry';
      case 'car':
        return 'Voiture';
    }
  };

  // Compute departure & arrival prayer times for reference
  const originPrayers = computePrayersForLocation(
    itinerary.origin.lat,
    itinerary.origin.lng,
    new Date(itinerary.travelDate),
    itinerary.calculationMethod,
    itinerary.asrMethod
  );

  const destinationPrayers = computePrayersForLocation(
    itinerary.destination.lat,
    itinerary.destination.lng,
    new Date(itinerary.travelDate),
    itinerary.calculationMethod,
    itinerary.asrMethod
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Travel Overview & Fiqh Concession Summary */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Itinéraire Voyageur
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {new Date(itinerary.travelDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {itinerary.isTravelerConcessionApplicable && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Rukhsah al-Safar (&gt; 80 km)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-3">
              <span>{itinerary.origin.name}</span>
              <ArrowRight className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{itinerary.destination.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Distance estimée : <strong className="text-stone-800">{itinerary.totalDistanceKm} km</strong> • Durée approximative : <strong className="text-stone-800">{itinerary.totalDurationHours}h</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCalendar}
              title="Exporter au calendrier .ics"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 transition-colors"
            >
              <Calendar className="w-4 h-4 text-stone-600" />
              <span>Export Calendrier</span>
            </button>

            <button
              onClick={onPrintItinerary}
              title="Imprimer la feuille de route du voyageur"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Fiche Prières</span>
            </button>
          </div>
        </div>

        {/* Fiqh Concession (Rukhsah) Explanatory Box */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-stone-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>Règles du Voyageur Applicables à votre Trajet (Fiqh al-Safar)</span>
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {itinerary.rukhsahDetails.recommendation}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
                <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                  ✨ Qasr : Dhuhr (2), Asr (2), Isha (2)
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                  ✨ Jam' : Dhuhr + Asr / Maghrib + Isha
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                  ✨ Wudu : Essuyage sur chaussettes (72h)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Prayer Windows at Origin vs Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin Prayer Windows */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Horaires au départ</span>
              <h3 className="text-sm font-bold text-stone-900">{itinerary.origin.name}</h3>
            </div>
            <button
              onClick={() => onOpenQiblaForLocation(itinerary.origin.lat, itinerary.origin.lng, itinerary.origin.name)}
              className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Qibla {originPrayers.qiblaBearing}°</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
            {originPrayers.prayers.map((p) => (
              <div key={p.id} className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[11px] font-medium text-stone-500">{p.name}</p>
                <p className="text-xs font-bold text-stone-900 mt-0.5">{p.time}</p>
                <span className="text-[10px] text-stone-400 font-serif">{p.arabicName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Destination Prayer Windows */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Horaires à l'arrivée</span>
              <h3 className="text-sm font-bold text-stone-900">{itinerary.destination.name}</h3>
            </div>
            <button
              onClick={() => onOpenQiblaForLocation(itinerary.destination.lat, itinerary.destination.lng, itinerary.destination.name)}
              className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Qibla {destinationPrayers.qiblaBearing}°</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
            {destinationPrayers.prayers.map((p) => (
              <div key={p.id} className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                <p className="text-[11px] font-medium text-stone-500">{p.name}</p>
                <p className="text-xs font-bold text-stone-900 mt-0.5">{p.time}</p>
                <span className="text-[10px] text-stone-400 font-serif">{p.arabicName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segments & Prayer Stops Timeline */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <span>Étapes du Voyage & Arrêts de Prière</span>
        </h2>

        {itinerary.segments.map((segment, index) => (
          <div
            key={segment.id || `seg-${index}`}
            className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
          >
            {/* Segment Header */}
            <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  {getTransportIcon(segment.transportMode)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Étape {index + 1} : {getTransportLabel(segment.transportMode)}
                    </span>
                    {segment.flightOrTrainNumber && (
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-200/80 text-stone-700 font-mono font-medium">
                        {segment.flightOrTrainNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-0.5">
                    {segment.from.name} ➔ {segment.to.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 font-medium">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{segment.departureTime} ➔ {segment.arrivalTime}</span>
                </div>
                <span className="text-stone-400 font-medium">{segment.distanceKm} km</span>
              </div>
            </div>

            {/* Segment Body & Prayer Advice */}
            <div className="p-5 space-y-4">
              {/* En-route prayers reminder */}
              {segment.enRoutePrayers && segment.enRoutePrayers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-700">Prières rencontrées sur cette étape :</span>
                  {segment.enRoutePrayers.map((p) => {
                    const key = `${segment.id}-${p}`;
                    const isDone = !!completedPrayers[key];
                    return (
                      <button
                        key={p}
                        onClick={() => togglePrayerDone(key)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-white' : 'text-stone-400'}`} />
                        <span>{p}</span>
                        {isDone && <span className="text-[10px] font-bold uppercase">(Priée)</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Travel Tips */}
              {segment.travelTips && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{segment.travelTips}</p>
                </div>
              )}

              {/* Recommended Prayer Stops / Facilities */}
              {segment.prayerStops && segment.prayerStops.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lieux & Horaires recommandés pour prier</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {segment.prayerStops.map((stop) => (
                      <div
                        key={stop.id}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-emerald-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            Prière de {stop.prayerName}
                          </span>
                          <span className="text-xs font-mono font-bold text-stone-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {stop.recommendedTime} ({stop.suggestedDurationMinutes} min)
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-stone-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{stop.locationName}</span>
                          </p>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {stop.fiqhAdvice}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-stone-500">
                            Qibla conseillée : <strong>{stop.qiblaBearing}°</strong>
                          </span>
                          <button
                            onClick={() => onOpenQiblaForLocation(segment.to.lat, segment.to.lng, stop.locationName)}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Ouvrir Boussole</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
