import data from "@/assets/registroJS.js";
import { v4 as uuidv4 } from "uuid";



const newData = (data) => {
  return data.map((item) => {
    return {
      Id: uuidv4(),
      date: new Date(item.date.split("/").reverse().join("-")).getTime(),
      uni: item.uni,
      details: item.details,
      brand: item.brand,
      quantity: parseFloat(item.quantity),
      category: item.category,
      account: item.account,
      type: item.type,
      mount: parseFloat(item.mount),
    };
  });
}

export default newData;