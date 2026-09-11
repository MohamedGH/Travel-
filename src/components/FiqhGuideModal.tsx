import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Send, ShieldCheck, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';
import { FIQH_GUIDE_ITEMS } from '../data/fiqhGuide';
import { FiqhGuideItem } from '../types';

interface FiqhGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTripContext?: string;
}

export const FiqhGuideModal: React.FC<FiqhGuideModalProps> = ({
  isOpen,
  onClose,
  currentTripContext,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'ask_ai'>('guide');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(FIQH_GUIDE_ITEMS[0].id);

  // AI Counselor state
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen) return null;

  const filteredItems = selectedCategory === 'all'
    ? FIQH_GUIDE_ITEMS
    : FIQH_GUIDE_ITEMS.filter((item) => item.category === selectedCategory);

  const handleAskAi = async (customPrompt?: string) => {
    const q = customPrompt || question;
    if (!q.trim()) return;

    setIsLoadingAi(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/ai/fiqh-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          tripContext: currentTripContext || 'Voyage multimodal',
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setAiAnswer(data.answer);
      } else {
        setAiAnswer(data.error || "Impossible d'obtenir une réponse pour le moment.");
      }
    } catch (err: any) {
      setAiAnswer("Erreur de connexion avec le conseiller Fiqh.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] border border-stone-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Guide & Fiqh du Voyageur (Fiqh al-Safar)</h3>
              <p className="text-[11px] text-stone-400">Règles canoniques du raccourcissement, regroupement et purification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50 shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Règles & Dispenses Essentielles
          </button>

          <button
            onClick={() => setActiveTab('ask_ai')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ask_ai'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conseiller Fiqh IA (Questions Libres)</span>
          </button>
        </div>

        {/* Tab 1: Static Guide Items */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5 pb-2">
              {[
                { id: 'all', label: 'Toutes les règles' },
                { id: 'distance', label: 'Distance minimale' },
                { id: 'qasr', label: 'Qasr (Raccourcissement)' },
                { id: 'jam', label: 'Jam\' (Regroupement)' },
                { id: 'onboard', label: 'Avion, Train, Bateau, Voiture' },
                { id: 'wudu', label: 'Ablutions & Chaussettes' },
                { id: 'qibla', label: 'Orientation Qibla' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    selectedCategory === c.id
                      ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* List of Accordions */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isExpanded = expandedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className="border border-stone-200 rounded-xl overflow-hidden transition-all bg-stone-50/50"
                  >
                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-stone-100/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {item.badge}
                          </span>
                          <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                        </div>
                        <p className="text-xs text-stone-500 font-medium">{item.summary}</p>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 text-stone-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-stone-200 text-xs text-stone-700 space-y-3 leading-relaxed">
                        <div className="whitespace-pre-line">{item.content}</div>

                        {item.hadithOrDalil && (
                          <div className="p-3 bg-stone-50 rounded-lg border-l-3 border-emerald-600 italic text-stone-600 font-serif">
                            {item.hadithOrDalil}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Ask AI Counselor */}
        {activeTab === 'ask_ai' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Conseiller Spécialisé Fiqh al-Safar (Propulsé par Gemini 3.8 Flash)</span>
              </div>
              <p className="leading-relaxed">
                Posez toute question spécifique concernant votre situation de voyage : correspondances serrées, turbulences en vol, eau introuvable dans le train, direction de prière incertaine, durée de séjour autorisée à destination, etc.
              </p>
            </div>

            {/* Quick Question suggestions */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-600">Questions fréquentes :</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Comment prier assis dans un siège d'avion s'il y a des turbulences ?",
                  "Puis-je regrouper Dhuhr et Asr à l'aéroport avant de monter dans l'avion ?",
                  "Quelle est la durée maximale de séjour où l'on reste considéré comme voyageur ?",
                  "Comment faire ses ablutions dans un train sans renverser d'eau ?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(q);
                      handleAskAi(q);
                    }}
                    className="text-[11px] text-left px-2.5 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-stone-200 rounded-lg transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Response card */}
            {isLoadingAi && (
              <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center gap-3 text-xs text-stone-600">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <span>Consultation des références jurisprudentielles en cours...</span>
              </div>
            )}

            {aiAnswer && !isLoadingAi && (
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-2">
                <h5 className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Réponse du Conseiller Fiqh :</span>
                </h5>
                <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>
              </div>
            )}

            {/* Input field */}
            <div className="pt-2 mt-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAi();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Posez votre question sur les prières en voyage..."
                  className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoadingAi || !question.trim()}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
