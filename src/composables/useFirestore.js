import { ref } from "vue";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import appFirebase from "@/firebaseInit";

const db = getFirestore(appFirebase);

export function useFirestore(collectionName) {
  const data = ref([]);
  const loading = ref(false);

  async function fetchData() {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, collectionName));
    data.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  }

  async function addItem(newItem) {
    await addDoc(collection(db, collectionName), newItem);
    await fetchData(); // Recargar datos después de añadir
  }

  return { data, loading, fetchData, addItem };
}
