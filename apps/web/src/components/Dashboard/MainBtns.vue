<template>
  <!-- Navegación -->
  <div class="max-w-7xl mx-auto px-4 py-3">
    <div class="flex flex-row items-stretch gap-3">
      <!-- AccountBalanceBtn (2/5) -->
      <Suspense>
        <template #default>
          <AccountBalanceBtn
            data-tour="account-balance-btn"
            class="flex-[2]"
          ></AccountBalanceBtn>
        </template>
        <template #fallback>
          <div class="flex-[2]">
            <Loader />
          </div>
        </template>
      </Suspense>

      <!-- NewRecordBtn (3/5) -->
      <Suspense>
        <template #default>
          <NewRecordBtn
            data-tour="new-record-btn"
            class="flex-[3]"
          ></NewRecordBtn>
        </template>
        <template #fallback>
          <div class="flex-[3]">
            <Loader />
          </div>
        </template>
      </Suspense>
    </div>
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
