import React from 'react';
import {
  TravelTicketOption,
  TransportMode,
} from '../types';
import {
  Train,
  Plane,
  Car,
  Ship,
  Clock,
  Euro,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowUpDown,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TicketComparisonViewProps {
  tickets: TravelTicketOption[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: TravelTicketOption) => void;
  onOpenQibla: (lat: number, lng: number, name: string) => void;
  currentSort: 'cost' | 'duration' | 'salat';
  onSortChange: (sort: 'cost' | 'duration' | 'salat') => void;
  originName: string;
  destinationName: string;
  travelDate: string;
  totalDistanceKm: number;
}

const MODE_CONFIG: Record<
  TransportMode,
  { label: string; icon: React.FC<{ className?: string }>; colorClass: string; badgeBg: string }
> = {
  train: {
    label: 'Train / TGV',
    icon: Train,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-600 text-white',
  },
  flight: {
    label: 'Vol Aérien',
    icon: Plane,
    colorClass: 'text-sky-600 bg-sky-50 border-sky-200',
    badgeBg: 'bg-sky-600 text-white',
  },
  car: {
    label: 'Voiture / Covoit',
    icon: Car,
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-700 text-white',
  },
  boat: {
    label: 'Ferry / Bateau',
    icon: Ship,
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
    badgeBg: 'bg-teal-600 text-white',
  },
};

export const TicketComparisonView: React.FC<TicketComparisonViewProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onOpenQibla,
  currentSort,
  onSortChange,
  originName,
  destinationName,
  travelDate,
  totalDistanceKm,
}) => {
  if (tickets.length === 0) {
    return null;
  }

  // Find lowest price and fastest duration for badges
  const lowestPrice = Math.min(...tickets.map((t) => t.priceEstimateEuro));
  const fastestDuration = Math.min(...tickets.map((t) => t.durationHours));

  return (
    <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Algorithme Salât & Billets
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {tickets.length} options analysées • {totalDistanceKm} km
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Comparateur d'Itinéraires & Billets ({originName} ➔ {destinationName})
          </h2>
          <p className="text-xs text-stone-500">
            Tous les billets sont automatiquement vérifiés avec les horaires de prière réels et classés par prix croissant.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start md:self-auto shrink-0">
          <span className="text-[11px] font-bold text-stone-500 px-2 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-stone-400" />
            <span>Trier par :</span>
          </span>

          <button
            onClick={() => onSortChange('cost')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentSort === 'cost'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Euro className="w-3.5 h-3.5 text-emerald-700" />
            <span>Moins cher (€)</span>
          </button>

          <button
            onClick={() => onSortChange('duration')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentSort === 'duration'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Plus rapide</span>
          </button>

          <button
            onClick={() => onSortChange('salat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentSort === 'salat'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Confort Salât</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket, index) => {
          const modeInfo = MODE_CONFIG[ticket.transportMode];
          const ModeIcon = modeInfo.icon;
          const isSelected = selectedTicketId === ticket.id;
          const isCheapest = ticket.priceEstimateEuro === lowestPrice;
          const isFastest = ticket.durationHours === fastestDuration;

          return (
            <div
              key={ticket.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-stone-50/50'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm bg-white'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header of the Ticket Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Mode & Code */}
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${modeInfo.colorClass}`}>
                      <ModeIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-stone-900">
                          {ticket.providerName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {ticket.ticketCode}
                        </span>

                        {isCheapest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                            LE MOINS CHER
                          </span>
                        )}

                        {isFastest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                            LE PLUS RAPIDE
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-500 mt-0.5">
                        {ticket.priceBreakdown.details}
                      </p>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                          {ticket.priceEstimateEuro} €
                        </span>
                        <span className="text-xs text-stone-500 font-medium">estimé</span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        Base: {ticket.priceBreakdown.baseFare}€ • Frais/Péage: {ticket.priceBreakdown.taxesOrTolls}€
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid (Dep / Duration / Arr) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                  {/* Departure */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Départ
                    </span>
                    <div className="text-base font-black text-stone-900 font-mono">
                      {ticket.departureTime}
                    </div>
                    <div className="text-stone-600 font-medium truncate">{originName}</div>
                  </div>

                  {/* Duration & Distance */}
                  <div className="flex flex-col items-center justify-center border-y sm:border-y-0 sm:border-x border-stone-200/80 py-2 sm:py-0 px-2 text-center">
                    <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>{ticket.formattedDuration}</span>
                    </span>
                    <div className="w-24 h-0.5 bg-stone-300 my-1 rounded-full relative">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 absolute right-0 -top-0.5" />
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {ticket.distanceKm} km direct
                    </span>
                  </div>

                  {/* Arrival */}
                  <div className="space-y-0.5 text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Arrivée
                    </span>
                    <div className="text-base font-black text-stone-900 font-mono">
                      {ticket.arrivalTime}
                    </div>
                    <div className="text-stone-600 font-medium truncate">{destinationName}</div>
                  </div>
                </div>

                {/* Salât Alignment Analysis Section */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Vérification & Compatibilité Salât</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                        Score : {ticket.salatScore}% ({ticket.salatCompatibilityLabel})
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                      Règles de voyage : Qasr & Jam'
                    </span>
                  </div>

                  {/* Highlights and prayer checkpoints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ticket.salatHighlights.map((hl, hlIdx) => (
                      <div key={hlIdx} className="flex items-start gap-1.5 text-emerald-900 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed prayer stops pill row */}
                  {ticket.prayersChecked.length > 0 && (
                    <div className="pt-1.5 border-t border-emerald-200/60 flex flex-wrap gap-1.5">
                      {ticket.prayersChecked.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[11px] px-2 py-1 rounded-lg bg-white border border-emerald-200 text-stone-700 font-medium shadow-2xs flex items-center gap-1"
                        >
                          <span className="font-bold text-emerald-800">{p.name} ({p.time})</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-600 truncate max-w-[200px]">{p.locationDesc}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenQibla(ticket.itinerary.origin.lat, ticket.itinerary.origin.lng, ticket.itinerary.origin.name)}
                    className="text-xs font-semibold text-stone-600 hover:text-emerald-800 flex items-center gap-1.5 self-start transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Consulter la Qibla pour ce trajet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTicket(ticket)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <span>{isSelected ? '✓ Itinéraire Actuel Sélectionné' : 'Sélectionner cet Itinéraire'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
