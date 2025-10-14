import { v4 as uuidv4 } from "uuid";
import { parseMoneyFloat } from '@/utils/mathUtils';

const newDataFn = (data) => {
  return data.map((item) => {

    return {
      opeID: uuidv4(),
      date: new Date(item.date.split("/").reverse().join("-")).getTime(),
      account: item.account,
      type: item.type,
      details: {
        itemID: uuidv4(),
        itemUni: item.uni,
        itemName: item.details,
        brand: item.brand,
        quantity: parseMoneyFloat(item.quantity),
        category: item.category,
        price: parseMoneyFloat(item.mount),
      }

    };
  });
};

export { newDataFn }; 