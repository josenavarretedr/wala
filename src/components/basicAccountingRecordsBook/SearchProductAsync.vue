<template>
  <div>
    <!-- Contenedor para el componente de autocompletado -->
    <div id="autocomplete" class="my-5"></div>
  </div>
</template>

<script setup>
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

import appFirebase from "@/firebaseInit";
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";
const db = getFirestore(appFirebase);

const emit = defineEmits(["update:productToAdd"]);

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const products = ref([]);

// Función para obtener productos desde Firestore
async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  if (querySnapshot.empty) {
    products.value = [];
  } else {
    querySnapshot.forEach((doc) => {
      let productData = {
        uuid: doc.id,
        ...doc.data(),
      };
      products.value.push(productData);
    });
  }
}

// Función para obtener datos formateados para Algolia
function getDataForAlgolia() {
  if (products.value.length === 0) {
    return [];
  }

  let dataForAlgolia = products.value.map((product) => {
    return {
      productId: product.uuid,
      productDescription: product.description,
      productPrice: product.price,
    };
  });

  return dataForAlgolia;
}

// Obtener todos los productos
await fetchProducts();

onMounted(() => {
  // Inicializar el componente de autocompletado de Algolia
  autocomplete({
    container: "#autocomplete",
    placeholder: "Buscar producto...",
    getSources({ query }) {
      return [
        {
          sourceId: "products",
          getItems() {
            // Filtrar productos por descripción
            let dataFiltered = getDataForAlgolia().filter(
              ({ productDescription }) =>
                productDescription.toLowerCase().includes(query.toLowerCase())
            );

            return dataFiltered.length > 0
              ? dataFiltered.slice(0, 5)
              : [
                  {
                    productDescription: `Registrar nuevo producto: ${query}`,
                    isNewProduct: true,
                  },
                ];
          },
          templates: {
            item({ item, html }) {
              if (item.isNewProduct) {
                // Plantilla para nuevo producto
                return html`
                  <div
                    class="py-3 px-5 flex items-center justify-between border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
                    id="new-product"
                    class="resultsDiv"
                  >
                    <div class="flex flex-col">
                      <span class="font-semibold text-gray-800 text-lg"
                        >${item.productDescription}</span
                      >
                    </div>
                  </div>
                `;
              } else {
                // Plantilla para producto existente
                return html`
                  <div
                    class="py-3 px-5 flex items-center justify-between border-b border-gray-200 hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
                    id="${item.productId}"
                    class="resultsDiv"
                  >
                    <div class="flex flex-col">
                      <span class="font-semibold text-gray-800 text-lg"
                        >${item.productDescription}</span
                      >
                    </div>
                  </div>
                `;
              }
            },
            noResults() {
              return "No results.";
            },
          },
        },
      ];
    },
  });
});

// Agregar un event listener para manejar clics en los resultados
document.addEventListener("click", (e) => {
  let target = e.target;
  while (target && !target.classList.contains("resultsDiv")) {
    target = target.parentElement;
  }
  if (target) {
    if (target.id === "new-product") {
      // Manejar nuevo producto
      const description = target.textContent
        .trim()
        .replace("Registrar nuevo producto: ", "");
      emit("update:productToAdd", [
        {
          description,
          quantity: null,
          price: null,
          oldOrNewProduct: "new",
          selectedProductUuid: null,
        },
      ]);

      document.querySelector("#autocomplete input").value = "";
      document
        .querySelector("#autocomplete input")
        .dispatchEvent(new Event("input"));
    } else {
      // Manejar producto existente
      const selectedProduct = products.value.find(
        (product) => product.uuid === target.id
      );
      if (selectedProduct) {
        emit("update:productToAdd", [
          {
            selectedProductUuid: selectedProduct.uuid,
            description: selectedProduct.description,
            quantity: selectedProduct.quantity,
            price: selectedProduct.price,
            oldOrNewProduct: "old",
          },
        ]);
        document.querySelector("#autocomplete input").value = "";
        document
          .querySelector("#autocomplete input")
          .dispatchEvent(new Event("input"));
      } else {
        console.error("Selected product not found");
      }
      console.log("Selected product: ", target.id);
    }
  }
});
</script>
