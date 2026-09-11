import React from 'react';
import { Compass, BookOpen, Sparkles, Plane, Train, Ship, Car, HeartHandshake } from 'lucide-react';

interface HeaderProps {
  onOpenFiqhGuide: () => void;
  onOpenQiblaModal: () => void;
  onOpenDuaModal: () => void;
  onNewTrip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFiqhGuide,
  onOpenQiblaModal,
  onOpenDuaModal,
  onNewTrip,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewTrip}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-inner font-bold text-xl">
              س
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">Safarpra</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  Voyage & Prière
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Itinéraires multimodaux respectant les horaires de prière islamiques
              </p>
            </div>
          </div>

          {/* Transport mode indicators */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-stone-800/80 rounded-full border border-stone-700/60 text-xs text-stone-300">
            <span className="flex items-center gap-1 px-2 py-0.5 text-sky-300 font-medium">
              <Plane className="w-3.5 h-3.5" /> Avion
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-emerald-300 font-medium">
              <Train className="w-3.5 h-3.5" /> Train
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-amber-300 font-medium">
              <Ship className="w-3.5 h-3.5" /> Bateau
            </span>
            <span className="text-stone-600">•</span>
            <span className="flex items-center gap-1 px-2 py-0.5 text-rose-300 font-medium">
              <Car className="w-3.5 h-3.5" /> Voiture
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="header-dua-btn"
              onClick={onOpenDuaModal}
              title="Invocations du voyageur"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 transition-colors"
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Dou'a du Voyage</span>
            </button>

            <button
              id="header-qibla-btn"
              onClick={onOpenQiblaModal}
              title="Boussole Qibla"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-teal-200 border border-teal-500/30 transition-colors"
            >
              <Compass className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Qibla</span>
            </button>

            <button
              id="header-fiqh-btn"
              onClick={onOpenFiqhGuide}
              title="Règles du voyageur (Fiqh al-Safar)"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Fiqh Voyage</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
