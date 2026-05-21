import React, { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { buildPrompt } from '../../utils/promptBuilder';
import { generateScript } from '../../services/llmService';
import { validateScript } from '../../services/scriptValidator';
import { useLibraryStore } from '../../store/libraryStore';
import { useToastStore } from '../../store/toastStore';
import { Play, Save, Copy, RotateCcw, Check, AlertCircle } from 'lucide-react';

export default function ActionBar() {
  const store = useConfiguratorStore();
  const { saveScript } = useLibraryStore();
  const { addToast } = useToastStore();

  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const readyToGenerate = store.isReadyToGenerate();
  const hasScript = !!store.generatedScript;
  const isGenerating = store.isGenerating;
  const isValid = store.validationResults?.isValid;

  const handleGenerate = async () => {
    if (!readyToGenerate || isGenerating) return;

    store.setGenerating(true);
    setApiError(null);
    setSaveSuccess(false);
    addToast('Redactando guión con Gemini...', 'info');

    try {
      const config = {
        selectedArea: store.selectedArea,
        selectedIndicador: store.selectedIndicador,
        selectedNivel: store.selectedNivel,
        selectedFunnel: store.selectedFunnel,
        selectedRuta: store.selectedRuta,
        selectedVoz: store.selectedVoz,
        sector: store.sector
      };

      const promptData = buildPrompt(config);
      const scriptJson = await generateScript(promptData);
      
      const validation = validateScript(scriptJson, config);

      store.setGeneratedScript(scriptJson);
      store.setValidation(validation);

      if (validation.isValid) {
        addToast('¡Guión generado con éxito y 100% validado!', 'success');
      } else {
        addToast('Guión generado, pero contiene errores o advertencias metodológicas.', 'warning');
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Error al conectar con Gemini API.';
      setApiError(msg);
      addToast(msg, 'error');
    } finally {
      store.setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!hasScript || !isValid) return;

    try {
      const config = {
        selectedArea: store.selectedArea,
        selectedIndicador: store.selectedIndicador,
        selectedNivel: store.selectedNivel,
        selectedFunnel: store.selectedFunnel,
        selectedRuta: store.selectedRuta,
        selectedVoz: store.selectedVoz,
        sector: store.sector
      };

      addToast('Guardando guión en Firestore...', 'info');
      await saveScript(store.generatedScript, config);
      setSaveSuccess(true);
      addToast('Guión guardado con éxito en Firestore', 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      addToast('Error al guardar el guión en la nube.', 'error');
    }
  };

  const handleCopy = () => {
    if (!hasScript || !store.generatedScript?.guion) return;

    navigator.clipboard.writeText(store.generatedScript.guion);
    setCopied(true);
    addToast('Texto del guión copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    store.resetAll();
    setApiError(null);
    setSaveSuccess(false);
    addToast('Configuración reiniciada con éxito.', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Botones de acción principal */}
      <div className="flex flex-wrap gap-3">
        {/* Generar Guión */}
        <button
          type="button"
          disabled={!readyToGenerate || isGenerating}
          onClick={handleGenerate}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
            readyToGenerate && !isGenerating
              ? 'bg-gradient-to-r from-wala-600 to-wala-500 hover:from-wala-500 hover:to-wala-600 text-white shadow-lg shadow-wala-500/25 scale-[1.02] cursor-pointer'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800/80 dark:text-slate-500'
          }`}
        >
          <Play size={16} fill={readyToGenerate ? 'currentColor' : 'none'} />
          <span>{isGenerating ? 'Generando en Gemini...' : 'Generar Guión con Gemini'}</span>
        </button>

        {/* Guardar */}
        {hasScript && (
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 border cursor-pointer ${
              isValid
                ? saveSuccess
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500 dark:text-emerald-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/40 dark:hover:border-slate-700'
                : 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-40 dark:bg-slate-950/10 dark:border-slate-900 dark:text-slate-600'
            }`}
          >
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{saveSuccess ? 'Guardado!' : 'Guardar'}</span>
          </button>
        )}

        {/* Copiar */}
        {hasScript && (
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-300 border cursor-pointer ${
              copied
                ? 'bg-wala-50 text-wala-600 border-wala-500 dark:bg-wala-500/10 dark:border-wala-500 dark:text-wala-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/40 dark:hover:border-slate-700'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:border-slate-700 cursor-pointer"
          title="Reiniciar todo"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Alerta de Error de API */}
      {apiError && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-450">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Error de Generación:</span>
            {apiError}
          </div>
        </div>
      )}
    </div>
  );
}
