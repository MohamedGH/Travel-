import React, { useState } from 'react';
import { X, Volume2, Copy, Check, HeartHandshake, Sparkles } from 'lucide-react';
import { TRAVEL_DUAS } from '../data/fiqhGuide';

interface DuaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuaModal: React.FC<DuaModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (dua: typeof TRAVEL_DUAS[0]) => {
    const textToCopy = `${dua.title}\n\nArabe :\n${dua.arabic}\n\nPhonétique :\n${dua.transliteration}\n\nTraduction :\n${dua.translation}\n\nSource : ${dua.source}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const playDuaAudio = (dua: typeof TRAVEL_DUAS[0]) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dua.arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;

      utterance.onstart = () => setIsPlayingAudio(dua.id);
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Invocations Authentiques du Voyageur (Ad'iyyah as-Safar)</h3>
              <p className="text-[11px] text-stone-300">Prières prophétiques pour la protection et la bénédiction du trajet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Duas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {TRAVEL_DUAS.map((dua) => (
            <div
              key={dua.id}
              className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-4 hover:border-amber-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{dua.title}</span>
                </h4>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => playDuaAudio(dua)}
                    title="Écouter la récitation"
                    className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                      isPlayingAudio === dua.id
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio === dua.id ? 'animate-pulse text-amber-700' : ''}`} />
                    <span className="hidden sm:inline">Écouter</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(dua)}
                    title="Copier l'invocation"
                    className="p-2 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {copiedId === dua.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span className="hidden sm:inline">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Text with Vocalization */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 text-right font-serif text-lg sm:text-xl text-stone-900 leading-loose">
                {dua.arabic}
              </div>

              {/* Transliteration */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Phonétique
                </p>
                <p className="text-xs text-stone-700 italic bg-white/70 p-3 rounded-lg border border-stone-200/60 leading-relaxed">
                  {dua.transliteration}
                </p>
              </div>

              {/* Translation */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Traduction en français
                </p>
                <p className="text-xs text-stone-800 leading-relaxed font-medium">
                  {dua.translation}
                </p>
              </div>

              {/* Source */}
              <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 font-serif">
                Rapporté dans : {dua.source}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
