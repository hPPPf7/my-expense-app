import { useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

export interface Limit {
  id: string;
  account: string;
  startDate: string;
  limit: number;
  spent: number;
}

function isLimitActive(startDate: string) {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  return today.getTime() <= end.getTime();
}

export interface HandleRecordParams {
  selectedType: "expense" | "income";
  amount: string;
  selectedAccount: string;
  currentBalance: number;
  updateLocalBalance: (newBalance: number) => void;
  category?: string;
  detail?: string;
}

interface UseHandleRecordOptions {
  mode: "personal" | "business";
  limits?: Limit[];
  setLimits?: React.Dispatch<React.SetStateAction<Limit[]>>;
}

export function useHandleRecord({
  mode,
  limits,
  setLimits,
}: UseHandleRecordOptions) {
  return useCallback(
    async ({
      selectedType,
      amount,
      selectedAccount,
      currentBalance,
      updateLocalBalance,
      category,
      detail,
    }: HandleRecordParams) => {
      if (!auth.currentUser || !amount || !selectedAccount) return;

      const userId = auth.currentUser.uid;
      const recordsRef = collection(db, "users", userId, "records");
      const newAmount = parseInt(amount);
      const type = selectedType === "expense" ? "支出" : "收入";

      await addDoc(recordsRef, {
        type,
        amount: newAmount,
        account: selectedAccount,
        date: new Date().toISOString().slice(0, 10),
        ...(mode === "business" && { category, detail }),
      });

      const accountRef = doc(db, "users", userId, "accounts", selectedAccount);
      const newBalance =
        currentBalance + (selectedType === "income" ? newAmount : -newAmount);
      await updateDoc(accountRef, { balance: newBalance });
      updateLocalBalance(newBalance);

      if (
        mode === "personal" &&
        selectedType === "expense" &&
        limits &&
        setLimits
      ) {
        const matched = limits.find(
          (l) => l.account === selectedAccount && isLimitActive(l.startDate)
        );
        if (matched) {
          const spent = matched.spent + newAmount;
          setLimits((prev) =>
            prev.map((l) => (l.id === matched.id ? { ...l, spent } : l))
          );
          await updateDoc(doc(db, "limits", userId, "items", matched.id), {
            spent,
          });
        }
      }
    },
    [mode, limits, setLimits]
  );
}
