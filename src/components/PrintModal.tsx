import React from 'react';
import { X, Printer, ShieldCheck, MapPin, CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import { TravelItinerary } from '../types';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: TravelItinerary;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  itinerary,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header Actions */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">Feuille de Route Prières du Voyageur</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Lancer l'impression</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-travel-card" className="flex-1 overflow-y-auto p-8 space-y-6 text-stone-900">
          {/* Header Title */}
          <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-emerald-800">Safarpra</span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-600 border border-stone-300">
                  Feuille de Voyage Islamique
                </span>
              </div>
              <h1 className="text-xl font-bold mt-1">
                {itinerary.origin.name} ➔ {itinerary.destination.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Date : {itinerary.travelDate} • Distance : {itinerary.totalDistanceKm} km • Durée estimée : {itinerary.totalDurationHours}h
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 block">
                Statut : Voyageur (Safar)
              </span>
              <span className="text-[11px] text-stone-500">
                Qasr & Jam' autorisés
              </span>
            </div>
          </div>

          {/* Fiqh Summary Box */}
          <div className="p-3.5 rounded-xl border border-stone-300 bg-stone-50 text-xs space-y-1.5">
            <p className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Règles de dérogation appliquées (Rukhsah al-Safar)</span>
            </p>
            <p className="text-stone-700 leading-relaxed">
              {itinerary.rukhsahDetails.recommendation}
            </p>
            <p className="text-[11px] text-stone-600">
              • <strong>Qasr :</strong> Dhuhr (2 rak'ahs), Asr (2 rak'ahs), Isha (2 rak'ahs). Fajr (2) et Maghrib (3) restent inchangées.<br />
              • <strong>Jam' :</strong> Possibilité de regrouper Dhuhr + Asr, et Maghrib + Isha.
            </p>
          </div>

          {/* Stops and Prayer Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Programme des Arrêts & Horaires de Prière
            </h3>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100 text-stone-800 border-b border-stone-300">
                  <th className="py-2 px-3 text-left font-bold">Étape</th>
                  <th className="py-2 px-3 text-left font-bold">Prière</th>
                  <th className="py-2 px-3 text-left font-bold">Horaire & Durée</th>
                  <th className="py-2 px-3 text-left font-bold">Lieu / Espace</th>
                  <th className="py-2 px-3 text-left font-bold">Qibla</th>
                  <th className="py-2 px-3 text-center font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {itinerary.segments.flatMap((seg, segIdx) =>
                  seg.prayerStops.map((stop) => (
                    <tr key={stop.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-medium text-stone-700">
                        {seg.transportMode.toUpperCase()} ({seg.departureTime})
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-900">
                        {stop.prayerName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {stop.recommendedTime} ({stop.suggestedDurationMinutes}m)
                      </td>
                      <td className="py-2.5 px-3 text-stone-800 max-w-xs">
                        <div className="font-semibold">{stop.locationName}</div>
                        <div className="text-[10px] text-stone-500">{stop.fiqhAdvice}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-700">
                        {stop.qiblaBearing}°
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block w-4 h-4 border-2 border-stone-400 rounded-sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Traveler Checklist */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Trousse du Voyageur Musulman (Checklist)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-stone-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Tapis de voyage compact</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Petite bouteille / Spray d'eau Wudu</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Chaussettes propres (Mash 72h)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Boussole Safarpra</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>Dou'a du voyage mémorisé</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                <span>En-cas halal & eau de route</span>
              </label>
            </div>
          </div>

          {/* Departure Dua snippet */}
          <div className="p-3 bg-stone-100 rounded-xl text-center space-y-1">
            <p className="font-serif text-sm text-stone-900">
              سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ
            </p>
            <p className="text-[10px] text-stone-500 italic">
              « Qu'Allah vous accorde un voyage sûr, profitable et serein. »
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
