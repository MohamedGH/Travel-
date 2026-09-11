import React, { useState } from 'react';
import { Plane, Train, Ship, Car, Calendar, Clock, Sparkles, Navigation, ArrowRightLeft, Settings2, SlidersHorizontal, MapPin } from 'lucide-react';
import { TransportMode, CityPreset, TravelItinerary } from '../types';
import { POPULAR_CITIES } from '../data/cities';
import { CALCULATION_METHODS } from '../utils/prayerCalculator';
import { SAMPLE_TRIPS } from '../data/sampleTrips';

interface TripPlannerFormProps {
  onPlanTrip: (params: {
    origin: string;
    destination: string;
    travelDate: string;
    departureTime: string;
    transportModes: TransportMode[];
    calculationMethod: string;
    asrMethod: 'standard' | 'hanafi';
    useAi: boolean;
  }) => Promise<void>;
  onLoadPresetTrip: (trip: TravelItinerary) => void;
  isLoading: boolean;
}

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({
  onPlanTrip,
  onLoadPresetTrip,
  isLoading,
}) => {
  const [origin, setOrigin] = useState('Paris (Gare de Lyon)');
  const [destination, setDestination] = useState('Marseille (Gare Saint-Charles)');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('10:30');
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>(['train', 'flight', 'car', 'boat']);
  const [calcMethod, setCalcMethod] = useState('MWL');
  const [asrMethod, setAsrMethod] = useState<'standard' | 'hanafi'>('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleMode = (mode: TransportMode) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const swapOriginDest = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (useAi: boolean) => {
    if (!origin.trim() || !destination.trim()) return;
    onPlanTrip({
      origin,
      destination,
      travelDate,
      departureTime,
      transportModes: selectedModes,
      calculationMethod: calcMethod,
      asrMethod,
      useAi,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span>Créer un Voyage Conforme aux Prières</span>
          </h2>
          <p className="text-xs text-stone-300">
            Calculez les fenêtres de prière, les arrêts en gare/autoroute/aéroports et les dispenses du voyageur (Qasr & Jam')
          </p>
        </div>

        {/* Quick sample trip selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap">Exemples :</span>
          {SAMPLE_TRIPS.map((trip) => (
            <button
              key={trip.id}
              onClick={() => onLoadPresetTrip(trip)}
              className="text-xs px-2.5 py-1 bg-stone-800 hover:bg-emerald-900/50 hover:border-emerald-500/50 text-stone-200 border border-stone-700 rounded-lg whitespace-nowrap transition-colors"
            >
              {trip.title.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Origin & Destination inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Lieu de départ (Ville, Aéroport, Gare, Port)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                id="input-origin"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ex: Paris, Lyon, Alger, Tunis..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            {/* Quick city suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {POPULAR_CITIES.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setOrigin(`${c.name} (${c.country})`)}
                  className="text-[11px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Swap button */}
          <div className="md:col-span-2 flex justify-center pt-2 md:pt-4">
            <button
              type="button"
              onClick={swapOriginDest}
              title="Inverser départ et arrivée"
              className="p-2.5 rounded-full border border-stone-200 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-stone-600 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Lieu d'arrivée
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-teal-600 absolute left-3 top-3" />
              <input
                id="input-destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Marseille, Marrakech, Casablanca, Nice..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            {/* Quick city suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {POPULAR_CITIES.slice(5, 10).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDestination(`${c.name} (${c.country})`)}
                  className="text-[11px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-md transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date, Departure Time, and Transport Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Date */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Date du voyage
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                id="input-travel-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Time */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Heure de départ
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                id="input-departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Allowed Modes Selector */}
          <div className="lg:col-span-6">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Modes de transport souhaités
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Flight */}
              <button
                type="button"
                onClick={() => toggleMode('flight')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedModes.includes('flight')
                    ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Avion</span>
              </button>

              {/* Train */}
              <button
                type="button"
                onClick={() => toggleMode('train')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedModes.includes('train')
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Train</span>
              </button>

              {/* Boat */}
              <button
                type="button"
                onClick={() => toggleMode('boat')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedModes.includes('boat')
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Bateau</span>
              </button>

              {/* Car */}
              <button
                type="button"
                onClick={() => toggleMode('car')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedModes.includes('car')
                    ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Voiture</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Advanced Calculation Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-stone-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Masquer' : 'Paramètres avancés'} de calcul islamique (Convention & Asr)</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Convention de calcul des horaires
                </label>
                <select
                  value={calcMethod}
                  onChange={(e) => setCalcMethod(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Méthode jurisprudentielle pour l'Asr
                </label>
                <select
                  value={asrMethod}
                  onChange={(e) => setAsrMethod(e.target.value as 'standard' | 'hanafi')}
                  className="w-full text-xs py-2 px-3 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
                >
                  <option value="standard">Standard (Chaféite, Malékite, Hanbalite) - Ombre = 1x</option>
                  <option value="hanafi">Hanafite - Ombre = 2x (Horaire plus tardif)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-stone-100">
          {/* Instant calculation button */}
          <button
            id="btn-plan-standard"
            type="button"
            disabled={isLoading}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm border border-stone-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Calculer l'Itinéraire & Prières</span>
          </button>

          {/* AI Smart Optimizer Button */}
          <button
            id="btn-plan-ai"
            type="button"
            disabled={isLoading}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>{isLoading ? 'Optimisation en cours...' : 'Optimiser avec l\'IA (Salles & Escales)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
