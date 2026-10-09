import React, { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { Trash2, Calendar, Clipboard, Check, ChevronDown, ChevronUp, Sparkles, User } from 'lucide-react';

export default function ScriptCard({ entry, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeConfig = useConfiguratorStore();

  const { id, createdAt, config, script } = entry;

  const dateStr = new Date(createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!script?.guion) return;
    navigator.clipboard.writeText(script.guion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calcular coincidencia de parentesco con la configuración activa
  const matchDetails = [];
  let score = 0;
  let activeParams = 0;

  if (activeConfig.selectedArea) {
    activeParams++;
    if (activeConfig.selectedArea === config.area) {
      score++;
      matchDetails.push('Área');
    }
  }
  if (activeConfig.selectedIndicador) {
    activeParams++;
    if (activeConfig.selectedIndicador === config.indicador) {
      score++;
      matchDetails.push('Indicador');
    }
  }
  if (activeConfig.selectedNivel) {
    activeParams++;
    if (activeConfig.selectedNivel === config.nivel) {
      score++;
      matchDetails.push('Nivel');
    }
  }
  if (activeConfig.selectedFunnel) {
    activeParams++;
    if (activeConfig.selectedFunnel === config.funnel) {
      score++;
      matchDetails.push('Funnel');
    }
  }
  if (activeConfig.selectedRuta) {
    activeParams++;
    if (activeConfig.selectedRuta === config.ruta) {
      score++;
      matchDetails.push('Ruta');
    }
  }
  if (activeConfig.selectedVoz) {
    activeParams++;
    if (activeConfig.selectedVoz === config.voz) {
      score++;
      matchDetails.push('Voz');
    }
  }

  const hasParentesco = activeParams > 0 && score > 0;

  return (
    <div className={`bg-slate-950/60 border rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
      hasParentesco
        ? 'border-wala-500/40 dark:border-wala-500/30 hover:border-wala-500/60 shadow-lg shadow-wala-500/5'
        : 'border-slate-800 hover:border-slate-700/80'
    }`}>
      {/* Cabecera */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/20"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-wala-500/10 text-wala-400 border border-wala-500/20 rounded-full uppercase tracking-wider">
              Área {config.area}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full uppercase tracking-wider">
              {config.funnel}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full uppercase tracking-wider">
              {config.ruta}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full uppercase tracking-wider flex items-center gap-1">
              <User size={10} /> {config.voz}
            </span>

            {/* Premium Parentesco Badge */}
            {hasParentesco && (
              <span 
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border bg-gradient-to-r flex items-center gap-0.5 shadow-sm uppercase tracking-wider animate-slide-in ${
                  score === activeParams
                    ? 'from-emerald-500/10 to-wala-500/10 text-wala-600 dark:text-wala-400 border-wala-500/40 shadow-wala-500/10'
                    : score >= 3
                    ? 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-amber-500/10'
                    : 'from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 shadow-indigo-500/10'
                }`}
                title={`Coincide en: ${matchDetails.join(', ')}`}
              >
                🧬 Parentesco: {score}/{activeParams}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-200 truncate">
            {config.sector} · Indicador {config.indicador} (Nivel {config.nivel?.replace('_', '→')})
          </h4>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <Calendar size={10} />
            <span>{dateStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Copiar guión"
          >
            {copied ? <Check size={14} className="text-wala-400" /> : <Clipboard size={14} />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="p-2 rounded bg-slate-900 hover:bg-red-500/10 border border-slate-800/80 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Eliminar guión"
          >
            <Trash2 size={14} />
          </button>

          <div className="text-slate-500 p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Cuerpo desplegable */}
      {expanded && (
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/20 space-y-4">
          {script.resultado_identitario && (
            <div className="text-xs italic text-slate-400 border-l-2 border-amber-500/50 pl-2 py-0.5 leading-relaxed bg-slate-950/40 p-2 rounded-r-lg">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 block not-italic mb-0.5">Resultado Identitario:</span>
              "{script.resultado_identitario.frase_ancla}"
            </div>
          )}

          {script.over_delivery?.presente && (
            <div className="text-xs text-slate-300 bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <Sparkles size={11} className="text-emerald-400 animate-pulse" />
                <span>Over-Delivery ({script.over_delivery.tipo?.replace('_', ' ')}) {script.over_delivery.timestamp ? `[${script.over_delivery.timestamp}]` : ''}:</span>
              </div>
              <p className="leading-relaxed">"{script.over_delivery.texto}"</p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Guión:</span>
            <div className="bg-slate-950/90 rounded-lg p-4 border border-slate-800/80 text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-wrap select-text max-h-[220px] overflow-y-auto">
              {script.guion}
            </div>
          </div>

          {script.cta && (
            <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <span className="text-[9px] font-bold uppercase tracking-wider text-wala-400 block mb-0.5">CTA:</span>
              "{script.cta.texto_cta}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
