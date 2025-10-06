<template>
  <!-- Navegación -->
  <div
    class="flex flex-row justify-center items-stretch gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto bg-white p-2"
  >
    <Suspense>
      <template #default>
        <AccountBalanceBtn
          class="flex-1 max-w-xs sm:max-w-sm"
        ></AccountBalanceBtn>
      </template>
      <template #fallback>
        <div class="flex-1 max-w-xs sm:max-w-sm">
          <Loader />
        </div>
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <NewRecordBtn class="flex-1 max-w-xs sm:max-w-sm"></NewRecordBtn>
      </template>
      <template #fallback>
        <div class="flex-1 max-w-xs sm:max-w-sm">
          <Loader />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import NewRecordBtn from "@/components/basicAccountingRecordsBook/NewRecordBtn.vue";
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";
import AccountBalanceBtn from "../AccountsBalanceApp/AccountBalanceBtn.vue";

function finalizarRegistro() {
  // Lógica para finalizar y registrar
  console.log("Finalizar y Registrar");
}
</script>
