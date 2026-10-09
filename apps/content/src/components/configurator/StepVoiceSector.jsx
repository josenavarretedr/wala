import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useLibraryStore } from '../../store/libraryStore';
import { VOCES_POR_FUNNEL } from '../../utils/compatibilityRules';
import { User, ShieldAlert, Sparkles } from 'lucide-react';

export default function StepVoiceSector() {
  const { selectedFunnel, selectedVoz, setVoz, sector, setSector } = useConfiguratorStore();
  const { scripts } = useLibraryStore();

  const vocesDisponibles = useMemo(() => {
    if (!selectedFunnel) return [];
    return VOCES_POR_FUNNEL[selectedFunnel] || [];
  }, [selectedFunnel]);

  if (!selectedFunnel) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm opacity-60 transition-all duration-300">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">6</span>
          Voz y Sector del Emprendedor
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-3 italic">Selecciona la etapa de funnel primero para configurar la voz y el sector.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all duration-300 space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">6</span>
        Voz y Sector del Emprendedor
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Voz Narrativa */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Voz Narrativa</label>
          <div className="flex gap-2">
            {['Jose', 'WALA'].map((voz) => {
              const esCompatible = vocesDisponibles.includes(voz);
              const isSelected = selectedVoz === voz;
              const count = scripts.filter((s) => s.config.voz === voz).length;

              return (
                <button
                  key={voz}
                  type="button"
                  disabled={!esCompatible}
                  onClick={() => esCompatible && setVoz(voz)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-wala-500 text-wala-700 shadow-md ring-2 ring-wala-500/20 dark:bg-slate-800 dark:border-wala-500 dark:text-wala-400'
                      : esCompatible
                      ? 'bg-slate-50/40 border-slate-200/70 text-slate-700 hover:bg-slate-100/50 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/60'
                      : 'bg-slate-100/20 border-slate-200/45 text-slate-400 cursor-not-allowed opacity-40 dark:bg-slate-950/10 dark:border-slate-900/40 dark:text-slate-600'
                  }`}
                >
                  <User size={16} />
                  <span>{voz === 'Jose' ? 'José (Voz A)' : 'WALA (Voz B)'}</span>
                  {count > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-wala-500/10 dark:bg-wala-500/20 text-wala-600 dark:text-wala-400 border border-wala-500/10 dark:border-wala-500/25 flex items-center gap-0.5" title={`${count} guiones guardados`}>
                      📂 {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedFunnel === 'BOFU' && (
            <p className="text-[10px] text-amber-600 dark:text-amber-500 italic flex items-center gap-1 mt-1">
              <ShieldAlert size={12} />
              BOFU requiere estrictamente la Voz de José (Principio #14).
            </p>
          )}
          {selectedFunnel === 'MOFU-A' && (
            <p className="text-[10px] text-amber-600 dark:text-amber-500 italic flex items-center gap-1 mt-1">
              <ShieldAlert size={12} />
              MOFU-A es exclusivo de José (Regla crítica V10).
            </p>
          )}
        </div>

        {/* Sector Libre */}
        <div className="space-y-2">
          <label htmlFor="sector-input" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Sector del Emprendedor</label>
          <div className="relative">
            <input
              id="sector-input"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej: Repostería, Taller Mecánico, Bodega..."
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-450 focus:outline-none focus:border-wala-500 focus:ring-2 focus:ring-wala-500/20 transition-all duration-300 dark:bg-slate-950/60 dark:border-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500"
            />
            {sector && (
              <span className="absolute right-3.5 top-3 text-[10px] font-bold text-wala-600 dark:text-wala-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> listo
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-snug">
            Se inyectará en el over-delivery y costo de inacción para dar hiper-personalización sectorial al guion.
          </p>
        </div>
      </div>
    </div>
  );
}
