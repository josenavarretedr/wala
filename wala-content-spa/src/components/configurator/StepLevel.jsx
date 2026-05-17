import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { getAllBancos } from '../../services/fileParser';
import { Layers, HelpCircle } from 'lucide-react';

export default function StepLevel() {
  const { selectedArea, selectedIndicador, selectedNivel, setNivel } = useConfiguratorStore();

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
      <div className="bg-slate-900/40 opacity-50 rounded-2xl p-5 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500">3</span>
          Selecciona el Tramo de Nivel
        </h3>
        <p className="text-sm text-slate-500 mt-3 italic">Selecciona un indicador primero para ver los niveles disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">3</span>
        Selecciona el Tramo de Nivel
      </h3>

      {niveles.length === 0 ? (
        <p className="text-sm text-amber-500 mt-2">No se encontraron niveles para este indicador en el banco de acciones.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {niveles.map((niv) => {
            const isSelected = selectedNivel === niv.key;
            const levelLabel = niv.key.replace('_', ' → ');
            return (
              <button
                key={niv.key}
                onClick={() => setNivel(niv.key)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-slate-800/90 border-wala-500 ring-2 ring-wala-500/20 shadow-lg scale-[1.01]' 
                    : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-bold text-wala-400">Tramo de Nivel {levelLabel}</div>
                  <div className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-900 rounded-full">
                    {niv.acciones.length} Acciones
                  </div>
                </div>
                {niv.descripcion && (
                  <p className="text-xs italic text-slate-400 mb-3 leading-relaxed border-l-2 border-slate-700 pl-2">
                    {niv.descripcion}
                  </p>
                )}
                {niv.acciones.length > 0 && (
                  <div className="space-y-1.5 mt-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-900">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Acciones de referencia:</span>
                    {niv.acciones.map((acc, index) => (
                      <div key={index} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                        <span className="text-wala-400 mt-0.5">•</span>
                        <span>{acc.texto} <span className="text-slate-500 font-medium">({acc.frecuencia})</span></span>
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
