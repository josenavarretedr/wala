import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { FileText, Award, AlertCircle, Quote, Sparkles, HelpCircle, Compass } from 'lucide-react';

export default function ScriptViewer() {
  const { generatedScript, isGenerating } = useConfiguratorStore();

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 border border-slate-800/80 rounded-2xl min-h-[450px]">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-wala-600/20 border-t-wala-500 animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wala-400 animate-pulse" size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Redactando Guión en Grok-3-Mini...</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-2 leading-relaxed">
          Inyectando el Prompt Maestro V10, las metodologías de Hormozi y el contexto del sector. Esto tomará unos segundos.
        </p>
      </div>
    );
  }

  if (!generatedScript) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl min-h-[450px] text-slate-500">
        <FileText size={48} className="mb-4 text-slate-700 animate-pulse" />
        <h3 className="text-base font-bold text-slate-400">Sin Guión Generado</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
          Configura todas las opciones del panel izquierdo y haz clic en "Generar Guión" para comenzar la magia.
        </p>
      </div>
    );
  }

  const s = generatedScript;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="text-wala-400" size={18} />
            Guión Producido (Grok V10)
          </h2>
          <p className="text-xs text-slate-400">
            {s.metadatos?.etapa_funnel || 'TOFU'} · {s.metadatos?.ruta_maestra || 'Ruta'} · Voz {s.metadatos?.voz || 'A'} · {s.metadatos?.duracion_estimada || '40-60s'}
          </p>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-950/80 rounded border border-slate-800 text-wala-400 uppercase tracking-widest">
          {s.version || 'v10'}
        </div>
      </div>

      {/* Capa emocional */}
      {s.resultado_identitario && (
        <div className="bg-slate-950/60 border-l-4 border-amber-500/80 p-4 rounded-r-xl space-y-1 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
            <Quote size={10} /> Capa Identitaria: {s.resultado_identitario.capa}
          </span>
          <p className="text-sm font-semibold text-slate-200 italic leading-relaxed">
            "{s.resultado_identitario.frase_ancla}"
          </p>
        </div>
      )}

      {/* Secciones de Contenido Hormozi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {s.over_delivery?.presente && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wala-400 block">
              ⭐ Over-Delivery ({s.over_delivery.tipo})
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {s.over_delivery.texto}
            </p>
          </div>
        )}

        {s.costo_inaccion?.presente && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
              🛑 Costo de Inacción
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {s.costo_inaccion.texto}
            </p>
          </div>
        )}
      </div>

      {/* Texto principal del guión */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Estructura del Guión Completo</label>
        <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-850 font-sans text-slate-100 text-sm leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto select-text selection:bg-wala-500/20 shadow-inner border border-slate-800/80">
          {s.guion || 'Guión vacío.'}
        </div>
      </div>

      {/* Bloque CTA */}
      {s.cta && (
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wala-400">
              📣 Call To Action (CTA): {s.cta.tipo}
            </span>
            {s.cta.menciona_diagnostico && (
              <span className="text-[9px] font-bold bg-wala-500/10 text-wala-400 px-2 py-0.5 rounded border border-wala-500/20">
                Menciona Diagnóstico Gratis
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-200">
            "{s.cta.texto_cta}"
          </p>
        </div>
      )}
    </div>
  );
}
