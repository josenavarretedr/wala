import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { Target, Users, Flame, Award } from 'lucide-react';

const FUNNELS = [
  { 
    id: 'TOFU', 
    name: 'TOFU (Atracción)', 
    icon: Users,
    desc: 'Atraer público frío. Resuelve dolor específico con un tip concreto. Promueve WALA freemium.',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400'
  },
  { 
    id: 'MOFU-A', 
    name: 'MOFU-A (Consideración)', 
    icon: Target,
    desc: 'Llevar al diagnóstico gratuito. Muestra que la herramienta sola no alcanza. Voz exclusiva de José.',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400'
  },
  { 
    id: 'MOFU-B', 
    name: 'MOFU-B (Activación)', 
    icon: Flame,
    desc: 'Convertir freemium a WALA Pro (7 días gratis). Muestra diferencia entre tener datos y claridad real.',
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400'
  },
  { 
    id: 'BOFU', 
    name: 'BOFU (Conversión)', 
    icon: Award,
    desc: 'Diagnóstico gratuito a cierre de programa. Transformación identitaria completa. Garantía + Urgencia.',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400'
  }
];

export default function StepFunnel() {
  const { selectedNivel, selectedFunnel, setFunnel } = useConfiguratorStore();

  if (!selectedNivel) {
    return (
      <div className="bg-slate-900/40 opacity-50 rounded-2xl p-5 border border-slate-800/80 shadow-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-500">4</span>
          Selecciona la Etapa de Funnel
        </h3>
        <p className="text-sm text-slate-500 mt-3 italic">Selecciona un nivel primero para habilitar las etapas de funnel.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">4</span>
        Selecciona la Etapa de Funnel
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {FUNNELS.map((f) => {
          const Icon = f.icon;
          const isSelected = selectedFunnel === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFunnel(f.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-800/90 border-wala-500 ring-2 ring-wala-500/20 shadow-lg scale-[1.01]' 
                  : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded bg-gradient-to-br ${f.color} border border-slate-800/60`}>
                  <Icon size={16} />
                </div>
                <div className="text-sm font-bold text-slate-200">{f.name}</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {f.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
