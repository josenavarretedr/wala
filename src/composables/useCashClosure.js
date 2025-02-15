// src/composables/useCashClosure.js
import { getFirestore, collection, setDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { useTransactionStore } from "@/stores/transactionStore";



const db = getFirestore(appFirebase);

const transactionStore = useTransactionStore();


export function useCashClosure() {
  /**
   * Obtiene los saldos esperados desde transactions
   */
  const getExpectedBalances = async (transactions) => {
    try {
      let cashBalance = 0;
      let bankBalance = 0;

      transactionStore.getAllIncomeTransactionsInStore().forEach((transaction) => {
        if (transaction.account === "cash") {
          cashBalance += transaction.total;
        } else if (transaction.account === "bank") {
          bankBalance += transaction.total;
        }
      });

      return {
        cash: cashBalance,
        bank: bankBalance,
      };
    } catch (error) {
      console.error("Error fetching expected balances: ", error);
      throw error;
    }
  };

  /**
   * Guarda un cierre de caja en Firestore.
   */
  const createCashClosure = async (closureData, businessId = "ferrercard") => {
    try {
      const closureRef = doc(db, `businesses/${businessId}/cashClosures`, closureData.uuid);
      await setDoc(closureRef, closureData);
      console.log("Cash closure recorded successfully");
    } catch (error) {
      console.error("Error creating cash closure: ", error);
      throw error;
    }
  };

  /**
   * Obtiene todos los cierres de caja almacenados.
   */
  const getCashClosures = async (businessId = "ferrercard") => {
    try {
      const cashClosuresSnapshot = await getDocs(collection(db, `businesses/${businessId}/cashClosures`));
      const closures = [];

      cashClosuresSnapshot.forEach((doc) => {
        closures.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return closures;
    } catch (error) {
      console.error("Error fetching cash closures: ", error);
      throw error;
    }
  };

  return {
    getExpectedBalances,
    createCashClosure,
    getCashClosures,
  };
}
