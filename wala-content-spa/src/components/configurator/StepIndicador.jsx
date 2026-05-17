import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { getAllBancos } from '../../services/fileParser';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export default function StepIndicador() {
  const { selectedArea, selectedIndicador, setIndicador } = useConfiguratorStore();

  const bancos = useMemo(() => getAllBancos(), []);
  
  const indicadores = useMemo(() => {
    if (!selectedArea) return [];
    const banco = bancos[selectedArea];
    return banco ? banco.indicadores : [];
  }, [selectedArea, bancos]);

  if (!selectedArea) {
    return (
      <div className="bg-slate-900/40 opacity-50 rounded-2xl p-5 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500">2</span>
          Selecciona el Indicador
        </h3>
        <p className="text-sm text-slate-500 mt-3 italic">Selecciona un área primero para ver los indicadores disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">2</span>
        Selecciona el Indicador
      </h3>

      {indicadores.length === 0 ? (
        <p className="text-sm text-amber-500 mt-2">No se encontraron indicadores en el banco de esta área. Asegúrate de que los archivos estén en src/assets/bancos/.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicadores.map((ind) => {
            const isSelected = selectedIndicador === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setIndicador(ind.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-slate-800/90 border-wala-500 ring-2 ring-wala-500/20 shadow-lg scale-[1.01]' 
                    : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
                }`}
              >
                <div className={`mt-0.5 rounded-full ${isSelected ? 'text-wala-400' : 'text-slate-600'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-wala-400 mb-0.5">Indicador {ind.id}</div>
                  <div className="text-sm font-medium text-slate-200 leading-tight">{ind.nombre}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
