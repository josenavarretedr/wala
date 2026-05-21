import React, { useState, useEffect } from 'react';
import StepArea from './components/configurator/StepArea';
import StepIndicador from './components/configurator/StepIndicador';
import StepLevel from './components/configurator/StepLevel';
import StepFunnel from './components/configurator/StepFunnel';
import StepRoute from './components/configurator/StepRoute';
import StepVoiceSector from './components/configurator/StepVoiceSector';
import ConfigSummary from './components/configurator/ConfigSummary';
import ScriptViewer from './components/output/ScriptViewer';
import ValidationPanel from './components/output/ValidationPanel';
import ActionBar from './components/output/ActionBar';
import ScriptLibrary from './components/library/ScriptLibrary';
import ToastNotification from './components/ui/ToastNotification';
import { useToastStore } from './store/toastStore';
import { useLibraryStore } from './store/libraryStore';
import { Sparkles, MessageSquareCode, Sun, Moon } from 'lucide-react';

export default function App() {
  const { addToast } = useToastStore();
  const { initLibraryListener, destroyLibraryListener } = useLibraryStore();

  useEffect(() => {
    initLibraryListener();
    return () => {
      destroyLibraryListener();
    };
  }, [initLibraryListener, destroyLibraryListener]);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wala-theme');
    return saved ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('wala-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    addToast(`Modo ${nextTheme === 'dark' ? 'oscuro' : 'claro'} activado con éxito.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-wala-500/30 selection:text-white transition-colors duration-300">
      {/* Premium Gradient Background Blur */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-wala-900/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-wala-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-80 right-20 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative space-y-8">
        {/* Header Premium */}
        <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-wala-600 to-emerald-600 rounded-2xl border border-wala-500/30 shadow-lg shadow-wala-500/10">
              <MessageSquareCode size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-wala-400 bg-clip-text text-transparent flex items-center gap-2">
                WALA Content Generator V10
                <span className="text-[10px] font-bold px-2 py-0.5 bg-wala-500/15 border border-wala-500/25 rounded-md text-wala-400 uppercase tracking-widest">SPA</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generador de guiones de alto impacto anclados en capas identitarias y metodologías de conversión de José Navarrete
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-900 hover:border-slate-700 transition-all shadow-md flex items-center justify-center cursor-pointer"
            title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400 animate-pulse" /> : <Moon size={18} className="text-indigo-400" />}
          </button>
        </header>

        {/* Formulario Principal de Doble Columna */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario de Configuración (Siempre Visible) */}
          <section className="lg:col-span-7 space-y-6">
            <StepArea />
            <StepIndicador />
            <StepLevel />
            <StepFunnel />
            <StepRoute />
            <StepVoiceSector />
            <ConfigSummary />
          </section>

          {/* Columna Derecha: Output y Validación */}
          <section className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <ScriptViewer />
            <ValidationPanel />
            <ActionBar />
          </section>
        </main>

        {/* Biblioteca de Guiones Guardados (Expandible/Completa) */}
        <footer className="border-t border-slate-800/60 pt-8">
          <ScriptLibrary />
        </footer>
      </div>
      <ToastNotification />
    </div>
  );
}
