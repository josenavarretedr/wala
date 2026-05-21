import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useLibraryStore } from '../../store/libraryStore';
import { getAllBancos } from '../../services/fileParser';

export default function StepLevel() {
  const { selectedArea, selectedIndicador, selectedNivel, setNivel } = useConfiguratorStore();
  const { scripts } = useLibraryStore();

  const bancos = useMemo(() => getAllBancos(), []);

  const indicador = useMemo(() => {
    if (!selectedArea || !selectedIndicador) return null;
    const banco = bancos[selectedArea];
    return banco?.indicadores.find(i => i.id === selectedIndicador) || null;
  }, [selectedArea, selectedIndicador, bancos]);

  const niveles = useMemo(() => {
    if (!indicador) return [];
    return Object.entries(indicador.niveles).map(([key, data]) => ({
      key,
      ...data
    }));
  }, [indicador]);

  if (!selectedIndicador) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm opacity-60 transition-all duration-300">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">3</span>
          Selecciona el Tramo de Nivel
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-3 italic">Selecciona un indicador primero para ver los niveles disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">3</span>
        Selecciona el Tramo de Nivel
      </h3>

      {niveles.length === 0 ? (
        <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">No se encontraron niveles para este indicador en el banco de acciones.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {niveles.map((niv) => {
            const isSelected = selectedNivel === niv.key;
            const levelLabel = niv.key.replace('_', ' → ');
            const count = scripts.filter((s) => s.config.nivel === niv.key).length;

            return (
              <button
                key={niv.key}
                onClick={() => setNivel(niv.key)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50/80 border-wala-500 text-emerald-900 ring-2 ring-wala-500/20 shadow-lg scale-[1.01] dark:bg-slate-800/90 dark:border-wala-500 dark:text-slate-100' 
                    : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-100/50 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`text-sm font-bold ${isSelected ? 'text-wala-700 dark:text-wala-400' : 'text-wala-600 dark:text-wala-400'}`}>Tramo de Nivel {levelLabel}</div>
                  <div className="flex items-center gap-1.5">
                    {count > 0 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-wala-500/10 dark:bg-wala-500/20 text-wala-600 dark:text-wala-400 border border-wala-500/10 dark:border-wala-500/25 flex items-center gap-0.5" title={`${count} guiones guardados`}>
                        📂 {count}
                      </span>
                    )}
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-100 text-emerald-800 dark:bg-slate-900 dark:text-slate-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500'}`}>
                      {niv.acciones.length} Acciones
                    </div>
                  </div>
                </div>
                {niv.descripcion && (
                  <p className={`text-xs italic mb-3 leading-relaxed border-l-2 pl-2 ${isSelected ? 'text-emerald-800 border-emerald-300 dark:text-slate-450 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 dark:border-slate-700'}`}>
                    {niv.descripcion}
                  </p>
                )}
                {niv.acciones.length > 0 && (
                  <div className={`space-y-1.5 mt-2 p-2.5 rounded-lg border transition-all ${isSelected ? 'bg-emerald-100/50 border-emerald-200 dark:bg-slate-950/30 dark:border-slate-900' : 'bg-slate-100/50 border-slate-200 dark:bg-slate-950/30 dark:border-slate-900'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isSelected ? 'text-emerald-800 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>Acciones de referencia:</span>
                    {niv.acciones.map((acc, index) => (
                      <div key={index} className={`text-xs flex items-start gap-1.5 leading-snug ${isSelected ? 'text-emerald-900 dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        <span className={`mt-0.5 ${isSelected ? 'text-wala-600 dark:text-wala-400' : 'text-wala-500 dark:text-wala-400'}`}>•</span>
                        <span>{acc.texto} <span className={`font-medium ${isSelected ? 'text-emerald-700/80 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>({acc.frecuencia})</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
