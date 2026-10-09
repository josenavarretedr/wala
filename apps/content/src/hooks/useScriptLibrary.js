import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wala_guiones_v1';

export function useScriptLibrary() {
  const [scripts, setScripts] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const save = (scriptData, config) => {
    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      config: {
        area: config.selectedArea,
        indicador: config.selectedIndicador,
        nivel: config.selectedNivel,
        funnel: config.selectedFunnel,
        ruta: config.selectedRuta,
        voz: config.selectedVoz,
        sector: config.sector
      },
      script: scriptData
    };
    const updated = [entry, ...scripts];
    setScripts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry.id;
  };

  const remove = (id) => {
    const updated = scripts.filter(s => s.id !== id);
    setScripts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { scripts, save, remove };
}
