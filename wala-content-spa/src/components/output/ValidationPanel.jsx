import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ValidationPanel() {
  const { generatedScript, validationResults } = useConfiguratorStore();

  if (!generatedScript || !validationResults) return null;

  const { isValid, errors, warnings } = validationResults;

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      isValid 
        ? 'bg-emerald-950/15 border-emerald-500/20' 
        : 'bg-rose-950/15 border-rose-500/20'
    }`}>
      <div className="flex items-center gap-2.5 mb-3 border-b border-slate-800/40 pb-2.5">
        {isValid ? (
          <ShieldCheck className="text-emerald-400" size={20} />
        ) : (
          <ShieldAlert className="text-rose-400" size={20} />
        )}
        <h3 className="text-sm font-bold text-slate-200">
          Autenticación y Validación Metodológica V10
        </h3>
      </div>

      <div className="space-y-3">
        {/* Errores Duros (Bloqueantes) */}
        {errors.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
              Errores Críticos (Guardado Bloqueado):
            </span>
            <div className="space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="text-xs text-rose-200/90 flex items-start gap-1.5 bg-rose-500/5 p-2 rounded border border-rose-500/10">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advertencias Blandas */}
        {warnings.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Advertencias de Optimización (Recomendadas):
            </span>
            <div className="space-y-1">
              {warnings.map((warn, i) => (
                <div key={i} className="text-xs text-amber-200/90 flex items-start gap-1.5 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                  <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todo Válido */}
        {isValid && errors.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="text-xs font-semibold">
              El guión cumple con el 100% de las restricciones de la arquitectura V10 y metodología Hormozi.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
