"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";

interface TransferRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  note: string;
  date: string;
}

export default function TransferPage() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        // 讀取帳戶列表
        const accountsRef = collection(db, "users", userId, "accounts");
        const accountsSnapshot = await getDocs(accountsRef);
        const accountsList = accountsSnapshot.docs.map(
          (doc) => doc.data().name
        );
        setAccounts(accountsList);
        setFrom(accountsList[0] || "");
        setTo(accountsList[0] || "");

        // 讀取轉帳紀錄
        const recordsRef = collection(
          db,
          "transfer-records",
          userId,
          "records"
        );
        const q = query(recordsRef, orderBy("date", "desc"));
        const recordsSnapshot = await getDocs(q);
        const recordsData = recordsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as TransferRecord[];
        setRecords(recordsData);
      }
    };

    fetchData();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFee(e.target.value);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value);
  };

  const submit = async () => {
    if (!amount || from === to || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const transferAmount = parseFloat(amount);
    const transferFee = parseFloat(fee) || 0;
    const today = new Date().toISOString().split("T")[0];

    // 新增轉帳紀錄
    const transferRecord = {
      from,
      to,
      amount: transferAmount,
      fee: transferFee,
      note,
      date: today,
    };

    try {
      const transferRef = collection(db, "transfer-records", userId, "records");
      const docRef = await addDoc(transferRef, transferRecord);
      setRecords((prev) => [{ id: docRef.id, ...transferRecord }, ...prev]);

      // 新增支出紀錄 (轉出)
      const expenseRef = collection(db, "users", userId, "records");
      await addDoc(expenseRef, {
        type: "支出",
        category: "轉帳支出",
        detail: `轉給 ${to}${
          transferFee ? `（含手續費 $${transferFee}）` : ""
        }${note ? `，備註：${note}` : ""}`,
        amount: transferAmount + transferFee,
        account: from,
        date: today,
      });

      // 新增收入紀錄 (轉入)
      const incomeRef = collection(db, "users", userId, "records");
      await addDoc(incomeRef, {
        type: "收入",
        category: "轉帳收入",
        detail: `來自 ${from}${note ? `，備註：${note}` : ""}`,
        amount: transferAmount,
        account: to,
        date: today,
      });

      setAmount("");
      setFee("");
      setNote("");
    } catch (error) {
      console.error("新增轉帳紀錄失敗", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">帳戶轉帳</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={from} onValueChange={setFrom}>
          <SelectTrigger>
            <SelectValue placeholder="轉出帳戶" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc} value={acc}>
                {acc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="self-center">➡️</span>

        <Select value={to} onValueChange={setTo}>
          <SelectTrigger>
            <SelectValue placeholder="轉入帳戶" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc} value={acc}>
                {acc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="金額"
          value={amount}
          onChange={handleAmountChange}
        />
        <Input
          type="number"
          placeholder="手續費 (可選)"
          value={fee}
          onChange={handleFeeChange}
        />
        <Input
          placeholder="備註 (可選)"
          value={note}
          onChange={handleNoteChange}
        />
        <Button
          onClick={submit}
          disabled={!from || !to || !amount || from === to}
        >
          轉帳
        </Button>
      </div>

      <div className="space-y-2">
        {records.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 text-sm">
              <div className="flex justify-between">
                <div>
                  {r.date}・{r.from} ➡️ {r.to}
                </div>
                <div className="font-medium">${r.amount}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                手續費 ${r.fee} ・{r.note || "無備註"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
