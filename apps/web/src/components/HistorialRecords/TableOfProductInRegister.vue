<template>
  <div>
    <table class="min-w-full text-left bg-white">
      <thead>
        <tr>
          <th class="py-2">Producto</th>
          <th class="py-2">Q</th>
          <th class="py-2">Precio uni</th>
          <th class="py-2 text-right">Precio Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in itemsListFromFirebaseInCmpt"
          :key="item.uuid"
          class="border-b"
        >
          <td class="py-2 text-left">{{ item.description }}</td>
          <td class="py-2 text-left">{{ item.quantity }}</td>
          <td class="py-2 text-left">S/{{ item.price }}</td>
          <td class="py-2 text-right">S/{{ item.price * item.quantity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Trash } from "@iconoir/vue";
import appFirebase from "@/firebaseInit";
import { getFirestore, doc, getDoc } from "firebase/firestore";
const db = getFirestore(appFirebase);

const props = defineProps({
  itemsList: {
    type: Array,
    default: () => [],
  },
});

const itemsListFromFirebaseInCmpt = ref([]);

async function getItemsInRegisterFromFirebase() {
  const itemsListFromFirebase = ref([]);

  console.log(props.itemsList);
  for (const item of props.itemsList) {
    let itemsListFromFirebasePreData = {
      description: null,
      quantity: null,
      price: null,
    };
    const docRef = doc(db, "products", item.item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();
      itemsListFromFirebasePreData.description = data.description;
      itemsListFromFirebasePreData.price = data.price;

      itemsListFromFirebasePreData.quantity =
        data.stockLog.filter((log) => log.uuid === item.stockLog)[0]
          ?.quantity || 0;
      // itemsListFromFirebase.value.push(docSnap.data());

      itemsListFromFirebase.value.push(itemsListFromFirebasePreData);

      console.log(itemsListFromFirebase.value);
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }
  itemsListFromFirebaseInCmpt.value = itemsListFromFirebase.value;
}

getItemsInRegisterFromFirebase();
</script>
