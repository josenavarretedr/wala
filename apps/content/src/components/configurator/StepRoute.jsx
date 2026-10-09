import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useLibraryStore } from '../../store/libraryStore';
import { RUTAS_POR_FUNNEL, RUTAS_META } from '../../utils/compatibilityRules';
import { Compass } from 'lucide-react';

export default function StepRoute() {
  const { selectedFunnel, selectedRuta, setRuta } = useConfiguratorStore();
  const { scripts } = useLibraryStore();

  const disponibles = useMemo(() => {
    if (!selectedFunnel) return [];
    return RUTAS_POR_FUNNEL[selectedFunnel] || [];
  }, [selectedFunnel]);

  if (!selectedFunnel) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm opacity-60 transition-all duration-300">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">5</span>
          Selecciona la Ruta Maestra
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-3 italic">Selecciona una etapa de funnel primero para ver las rutas compatibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">5</span>
        Selecciona la Ruta Maestra
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {disponibles.map((rutaId) => {
          const meta = RUTAS_META[rutaId] || { label: rutaId, descripcion: '', viralidad: 'medio', anguloBase: '' };
          const isSelected = selectedRuta === rutaId;
          const count = scripts.filter((s) => s.config.ruta === rutaId).length;
          
          return (
            <button
              key={rutaId}
              onClick={() => setRuta(rutaId)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'bg-emerald-50/80 border-wala-500 text-emerald-900 ring-2 ring-wala-500/20 shadow-lg scale-[1.01] dark:bg-slate-800/90 dark:border-wala-500 dark:text-slate-100' 
                  : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-100/50 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-sm font-bold ${isSelected ? 'text-emerald-950 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'}`}>{meta.label}</span>
                  <div className="flex items-center gap-1.5">
                    {count > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-wala-500/10 dark:bg-wala-500/20 text-wala-600 dark:text-wala-400 border border-wala-500/10 dark:border-wala-500/25 flex items-center gap-0.5" title={`${count} guiones guardados`}>
                        📂 {count}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      meta.viralidad === 'alto' 
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-450' 
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400'
                    }`}>
                      Viral: {meta.viralidad}
                    </span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-3 ${isSelected ? 'text-emerald-800 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {meta.descripcion}
                </p>
              </div>
              
              <div className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded border transition-all w-fit ${
                isSelected 
                  ? 'bg-emerald-100/50 border-emerald-250 text-emerald-800 dark:bg-slate-950/30 dark:border-slate-900/60 dark:text-slate-400' 
                  : 'bg-slate-100/50 border-slate-200 text-slate-500 dark:bg-slate-950/30 dark:border-slate-900/60 dark:text-slate-500'
              }`}>
                <Compass size={10} className="text-wala-600 dark:text-wala-400" />
                Ángulo Base: {meta.anguloBase}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
