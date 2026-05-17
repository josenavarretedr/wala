import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { VOCES_POR_FUNNEL } from '../../utils/compatibilityRules';
import { User, ShieldAlert, Sparkles } from 'lucide-react';

export default function StepVoiceSector() {
  const { selectedFunnel, selectedVoz, setVoz, sector, setSector } = useConfiguratorStore();

  const vocesDisponibles = useMemo(() => {
    if (!selectedFunnel) return [];
    return VOCES_POR_FUNNEL[selectedFunnel] || [];
  }, [selectedFunnel]);

  if (!selectedFunnel) {
    return (
      <div className="bg-slate-900/40 opacity-50 rounded-2xl p-5 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500">6</span>
          Voz y Sector del Emprendedor
        </h3>
        <p className="text-sm text-slate-500 mt-3 italic">Selecciona la etapa de funnel primero para configurar la voz y el sector.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">6</span>
        Voz y Sector del Emprendedor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Voz Narrativa */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Voz Narrativa</label>
          <div className="flex gap-2">
            {['Jose', 'WALA'].map((voz) => {
              const esCompatible = vocesDisponibles.includes(voz);
              const isSelected = selectedVoz === voz;

              return (
                <button
                  key={voz}
                  type="button"
                  disabled={!esCompatible}
                  onClick={() => esCompatible && setVoz(voz)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all duration-300 ${
                    isSelected
                      ? 'bg-slate-800 border-wala-500 text-wala-400 shadow-md ring-2 ring-wala-500/20'
                      : esCompatible
                      ? 'bg-slate-950/40 border-slate-800/50 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700/60'
                      : 'bg-slate-950/10 border-slate-900/40 text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                >
                  <User size={16} />
                  <span>{voz === 'Jose' ? 'José Navarrete (Voz A)' : 'WALA Copiloto (Voz B)'}</span>
                </button>
              );
            })}
          </div>
          {selectedFunnel === 'BOFU' && (
            <p className="text-[10px] text-amber-500 italic flex items-center gap-1 mt-1">
              <ShieldAlert size={12} />
              BOFU requiere estrictamente la Voz de José (Principio #14).
            </p>
          )}
          {selectedFunnel === 'MOFU-A' && (
            <p className="text-[10px] text-amber-500 italic flex items-center gap-1 mt-1">
              <ShieldAlert size={12} />
              MOFU-A es exclusivo de José (Regla crítica V10).
            </p>
          )}
        </div>

        {/* Sector Libre */}
        <div className="space-y-2">
          <label htmlFor="sector-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Sector del Emprendedor</label>
          <div className="relative">
            <input
              id="sector-input"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej: Repostería, Taller Mecánico, Bodega..."
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-wala-500 focus:ring-2 focus:ring-wala-500/20 transition-all duration-300"
            />
            {sector && (
              <span className="absolute right-3.5 top-3 text-[10px] font-bold text-wala-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> listo
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Se inyectará en el over-delivery y costo de inacción para dar hiper-personalización sectorial al guion.
          </p>
        </div>
      </div>
    </div>
  );
}
