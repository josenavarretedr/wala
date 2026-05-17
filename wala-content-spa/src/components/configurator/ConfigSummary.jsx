import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConfigSummary() {
  const { 
    selectedArea, selectedIndicador, selectedNivel,
    selectedFunnel, selectedRuta, selectedVoz, sector,
    isReadyToGenerate
  } = useConfiguratorStore();

  const ready = isReadyToGenerate();

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
      ready 
        ? 'bg-wala-900/10 border-wala-500/30' 
        : 'bg-slate-900/40 border-slate-800/80 shadow-md'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Resumen de Configuración</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
          ready 
            ? 'bg-wala-500/10 text-wala-400 border border-wala-500/20' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {ready ? (
            <>
              <CheckCircle2 size={10} /> Listo para Generar
            </>
          ) : (
            <>
              <AlertCircle size={10} /> Configuración Incompleta
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block">Área & Indicador:</span>
          <span className="font-semibold text-slate-200">
            {selectedArea ? `Área ${selectedArea}` : '—'}
            {selectedIndicador ? ` (Ind. ${selectedIndicador})` : ''}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Tramo Nivel:</span>
          <span className="font-semibold text-slate-200">
            {selectedNivel ? selectedNivel.replace('_', ' → ') : '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Funnel & Ruta:</span>
          <span className="font-semibold text-slate-200">
            {selectedFunnel ? `${selectedFunnel}` : '—'}
            {selectedRuta ? ` (${selectedRuta})` : ''}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Voz & Sector:</span>
          <span className="font-semibold text-slate-200">
            {selectedVoz ? `${selectedVoz}` : '—'}
            {sector ? ` (${sector})` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
