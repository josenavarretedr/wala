import { ref } from 'vue';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/firebaseInit';
import { useBusinessStore } from '@/stores/businessStore';
import { round2 } from '@/utils/mathUtils';

export function usePlanning() {
  const businessStore = useBusinessStore();
  const projection = ref(null);
  const recurringPayments = ref([]);
  const loading = ref(false);

  const ensureBusinessId = () => businessStore.business?.id || null;

  async function fetchProjection(periodKey) {
    const businessId = ensureBusinessId();
    if (!businessId || !periodKey) return null;
    loading.value = true;
    try {
      const snap = await getDoc(
        doc(db, 'businesses', businessId, 'projections', periodKey)
      );
      if (snap.exists()) {
        projection.value = { periodKey, ...snap.data() };
      } else {
        projection.value = null;
      }
      return projection.value;
    } catch (err) {
      console.warn('⚠️ Error cargando proyección:', err);
      projection.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function saveProjection(periodKey, { salesTarget, cogsPctTarget, fixedCostsTarget }) {
    const businessId = ensureBusinessId();
    if (!businessId || !periodKey) throw new Error('Falta negocio o período');

    const payload = {
      periodKey,
      salesTarget: round2(Number(salesTarget || 0)),
      cogsPctTarget: round2(Number(cogsPctTarget || 0)),
      fixedCostsTarget: round2(Number(fixedCostsTarget || 0)),
      updatedAt: serverTimestamp(),
    };

    const refDoc = doc(db, 'businesses', businessId, 'projections', periodKey);
    const existing = await getDoc(refDoc);
    if (!existing.exists()) {
      payload.createdAt = serverTimestamp();
    }

    await setDoc(refDoc, payload, { merge: true });
    projection.value = payload;
    return payload;
  }

  async function fetchRecurringPayments() {
    const businessId = ensureBusinessId();
    if (!businessId) return [];
    loading.value = true;
    try {
      const q = query(
        collection(db, 'businesses', businessId, 'recurringPayments'),
        orderBy('dueDay', 'asc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ uuid: d.id, ...d.data() }));
      recurringPayments.value = list;
      return list;
    } catch (err) {
      console.warn('⚠️ Error cargando pagos fijos:', err);
      recurringPayments.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createRecurringPayment({ title, category = 'overhead', dueDay = 1, expectedAmount }) {
    const businessId = ensureBusinessId();
    if (!businessId) throw new Error('No hay negocio activo');

    const id = uuidv4();
    const docData = {
      uuid: id,
      title: String(title || '').trim(),
      category: category || 'overhead',
      dueDay: Math.min(31, Math.max(1, Number(dueDay || 1))),
      expectedAmount: round2(Number(expectedAmount || 0)),
      isActive: true,
      lastPaidPeriod: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'businesses', businessId, 'recurringPayments', id), docData);
    await fetchRecurringPayments();
    return docData;
  }

  async function markRecurringPaid(paymentId, periodKey) {
    const businessId = ensureBusinessId();
    if (!businessId || !paymentId) return false;
    await updateDoc(doc(db, 'businesses', businessId, 'recurringPayments', paymentId), {
      lastPaidPeriod: periodKey,
      updatedAt: serverTimestamp(),
    });
    await fetchRecurringPayments();
    return true;
  }

  async function deleteRecurringPayment(paymentId) {
    const businessId = ensureBusinessId();
    if (!businessId || !paymentId) return false;
    await deleteDoc(doc(db, 'businesses', businessId, 'recurringPayments', paymentId));
    await fetchRecurringPayments();
    return true;
  }

  return {
    projection,
    recurringPayments,
    loading,
    fetchProjection,
    saveProjection,
    fetchRecurringPayments,
    createRecurringPayment,
    markRecurringPaid,
    deleteRecurringPayment,
  };
}
