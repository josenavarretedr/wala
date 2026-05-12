import { defineStore } from 'pinia';
import { db } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export const useConsultingAppStore = defineStore('consultingApp', {
  state: () => ({
    consultings: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchConsultings(businessId) {
      this.loading = true;
      this.error = null;
      try {
        const q = query(
          collection(db, 'consultings'),
          where('businessId', '==', businessId)
        );
        const snapshot = await getDocs(q);
        
        this.consultings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        return this.consultings;
      } catch (err) {
        console.error('Error fetching consultings:', err);
        this.error = 'No se pudieron cargar las asesorías';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createConsulting(businessId, data) {
      this.loading = true;
      this.error = null;
      try {
        const newConsulting = {
          ...data,
          businessId,
          status: 'Activa',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'consultings'), newConsulting);
        
        // Add to local state
        const addedConsulting = { id: docRef.id, ...newConsulting, createdAt: new Date(), updatedAt: new Date() };
        this.consultings.unshift(addedConsulting);
        
        return docRef.id;
      } catch (err) {
        console.error('Error creating consulting:', err);
        this.error = 'No se pudo crear la asesoría';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateConsulting(id, data) {
      this.loading = true;
      this.error = null;
      try {
        const consultingRef = doc(db, 'consultings', id);
        const updateData = {
          ...data,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(consultingRef, updateData);
        
        // Update local state
        const index = this.consultings.findIndex(c => c.id === id);
        if (index !== -1) {
          this.consultings[index] = { ...this.consultings[index], ...updateData, updatedAt: new Date() };
        }
      } catch (err) {
        console.error('Error updating consulting:', err);
        this.error = 'No se pudo actualizar la asesoría';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
