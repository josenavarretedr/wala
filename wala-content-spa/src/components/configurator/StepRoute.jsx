import React, { useMemo } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { RUTAS_POR_FUNNEL, RUTAS_META } from '../../utils/compatibilityRules';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';

export default function StepRoute() {
  const { selectedFunnel, selectedRuta, setRuta } = useConfiguratorStore();

  const disponibles = useMemo(() => {
    if (!selectedFunnel) return [];
    return RUTAS_POR_FUNNEL[selectedFunnel] || [];
  }, [selectedFunnel]);

  if (!selectedFunnel) {
    return (
      <div className="bg-slate-900/40 opacity-50 rounded-2xl p-5 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500">5</span>
          Selecciona la Ruta Maestra
        </h3>
        <p className="text-sm text-slate-500 mt-3 italic">Selecciona una etapa de funnel primero para ver las rutas compatibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">5</span>
        Selecciona la Ruta Maestra
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {disponibles.map((rutaId) => {
          const meta = RUTAS_META[rutaId] || { label: rutaId, descripcion: '', viralidad: 'medio', anguloBase: '' };
          const isSelected = selectedRuta === rutaId;
          
          return (
            <button
              key={rutaId}
              onClick={() => setRuta(rutaId)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-800/90 border-wala-500 ring-2 ring-wala-500/20 shadow-lg scale-[1.01]' 
                  : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-bold text-slate-200">{meta.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    meta.viralidad === 'alto' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    Viral: {meta.viralidad}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {meta.descripcion}
                </p>
              </div>
              
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1 bg-slate-950/30 px-2 py-1 rounded border border-slate-900/60 w-fit">
                <Compass size={10} className="text-wala-400" />
                Ángulo Base: {meta.anguloBase}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
