import { create } from 'zustand';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const USER_ID_KEY = 'wala_content_user_id';

// Obtener o generar un ID de usuario único local para aislar datos por navegador
const getOrGenerateUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Generar un ID aleatorio robusto
    userId = 'usr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

// Mapea un documento de Firestore a la estructura esperada por los componentes React de la SPA
const mapDocToScript = (docSnap) => {
  const data = docSnap.data();
  // Convierte el Timestamp de Firestore a string ISO para retrocompatibilidad total con la UI
  const createdAtStr = data.createdAt?.toDate 
    ? data.createdAt.toDate().toISOString() 
    : new Date().toISOString();

  return {
    id: docSnap.id,
    createdAt: createdAtStr,
    config: data.config || {},
    script: data.script || {}
  };
};

export const useLibraryStore = create((set, get) => ({
  scripts: [],
  loading: true,
  unsubscribeListener: null,

  // Inicializa el Listener en tiempo real con Firestore
  initLibraryListener: () => {
    // Si ya hay un listener activo, evitar duplicados
    if (get().unsubscribeListener) return;

    const q = query(
      collection(db, 'wala_guiones_v1'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const scripts = snapshot.docs.map(mapDocToScript);
        set({ scripts, loading: false });
        console.log(`🔥 [Firestore Sync] ${scripts.length} guiones globales sincronizados en tiempo real.`);
      },
      (err) => {
        console.error('❌ [Firestore Sync] Error al escuchar guiones:', err);
        set({ loading: false });
      }
    );

    set({ unsubscribeListener: unsub });
  },

  // Detiene el Listener en tiempo real si es necesario (limpieza en desmontaje)
  destroyLibraryListener: () => {
    const unsub = get().unsubscribeListener;
    if (unsub) {
      unsub();
      set({ unsubscribeListener: null });
      console.log('🔌 [Firestore Sync] Listener desactivado.');
    }
  },

  // Guarda un guion en Firestore
  saveScript: async (scriptData, config) => {
    try {
      const userId = getOrGenerateUserId();
      const docRef = doc(collection(db, 'wala_guiones_v1'));

      const entry = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        config: {
          area: config.selectedArea || null,
          indicador: config.selectedIndicador || null,
          nivel: config.selectedNivel || null,
          funnel: config.selectedFunnel || null,
          ruta: config.selectedRuta || null,
          voz: config.selectedVoz || null,
          sector: config.sector || ''
        },
        script: scriptData
      };

      await setDoc(docRef, entry);
      console.log('💾 [Firestore Save] Guion guardado con ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('❌ [Firestore Save] Error al guardar guion:', err);
      throw err;
    }
  },

  // Elimina un guion de Firestore
  removeScript: async (id) => {
    try {
      const docRef = doc(db, 'wala_guiones_v1', id);
      await deleteDoc(docRef);
      console.log('🗑️ [Firestore Delete] Guion eliminado con ID:', id);
    } catch (err) {
      console.error('❌ [Firestore Delete] Error al eliminar guion:', err);
      throw err;
    }
  }
}));
