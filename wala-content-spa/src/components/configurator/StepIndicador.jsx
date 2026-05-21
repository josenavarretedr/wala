import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useLibraryStore } from '../../store/libraryStore';
import { getAllBancos } from '../../services/fileParser';
import { CheckCircle2 } from 'lucide-react';

export default function StepIndicador() {
  const { selectedArea, selectedIndicador, setIndicador } = useConfiguratorStore();
  const { scripts } = useLibraryStore();

  const bancos = useMemo(() => getAllBancos(), []);
  
  const indicadores = useMemo(() => {
    if (!selectedArea) return [];
    const banco = bancos[selectedArea];
    return banco ? banco.indicadores : [];
  }, [selectedArea, bancos]);

  if (!selectedArea) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm opacity-60 transition-all duration-300">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">2</span>
          Selecciona el Indicador
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-3 italic">Selecciona un área primero para ver los indicadores disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">2</span>
        Selecciona el Indicador
      </h3>

      {indicadores.length === 0 ? (
        <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">No se encontraron indicadores en el banco de esta área. Asegúrate de que los archivos estén en src/assets/bancos/.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicadores.map((ind) => {
            const isSelected = selectedIndicador === ind.id;
            const count = scripts.filter((s) => s.config.indicador === ind.id).length;

            return (
              <button
                key={ind.id}
                onClick={() => setIndicador(ind.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50/80 border-wala-500 text-emerald-900 ring-2 ring-wala-500/20 shadow-lg scale-[1.01] dark:bg-slate-800/90 dark:border-wala-500 dark:text-slate-100' 
                    : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-100/50 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/60'
                }`}
              >
                <div className={`mt-0.5 rounded-full ${isSelected ? 'text-wala-600 dark:text-wala-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-wala-700 dark:text-wala-400' : 'text-wala-600 dark:text-wala-400'}`}>Indicador {ind.id}</span>
                    {count > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-wala-500/10 dark:bg-wala-500/20 text-wala-600 dark:text-wala-400 border border-wala-500/10 dark:border-wala-500/25 flex items-center gap-0.5" title={`${count} guiones guardados`}>
                        📂 {count}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-medium leading-tight ${isSelected ? 'text-emerald-950 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'}`}>{ind.nombre}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
