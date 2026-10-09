import { computed } from 'vue';
import { useConsultingAppStore } from '@/stores/consultingAppStore';

export function useConsultingApp() {
  const store = useConsultingAppStore();

  const consultings = computed(() => store.consultings);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  const fetchConsultings = async (businessId) => {
    return await store.fetchConsultings(businessId);
  };

  const createConsulting = async (businessId, data) => {
    return await store.createConsulting(businessId, data);
  };

  const updateConsulting = async (id, data) => {
    return await store.updateConsulting(id, data);
  };

  return {
    consultings,
    loading,
    error,
    fetchConsultings,
    createConsulting,
    updateConsulting
  };
}
