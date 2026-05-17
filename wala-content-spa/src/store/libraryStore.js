import { create } from 'zustand';

const STORAGE_KEY = 'wala_guiones_v1';

export const useLibraryStore = create((set) => ({
  scripts: (() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  })(),

  saveScript: (scriptData, config) => {
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

    set((state) => {
      const updated = [entry, ...state.scripts];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { scripts: updated };
    });

    return entry.id;
  },

  removeScript: (id) => {
    set((state) => {
      const updated = state.scripts.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { scripts: updated };
    });
  }
}));
