"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  updateDoc,
  doc,
} from "firebase/firestore";

export default function BusinessHomePage() {
  const [balance, setBalance] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [detail, setDetail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;

      const accountsRef = collection(db, "accounts", userId, "userAccounts");
      const accountsSnap = await getDocs(accountsRef);
      const accList: string[] = [];
      const accBalance: Record<string, number> = {};

      accountsSnap.forEach((doc) => {
        const data = doc.data();
        accList.push(data.name);
        accBalance[data.name] = data.balance ?? 0;
      });

      setAccounts(accList);
      setBalance(accBalance);

      const categoriesRef = collection(
        db,
        "categories",
        userId,
        "userCategories"
      );
      const categoriesSnap = await getDocs(categoriesRef);
      const catList: string[] = categoriesSnap.docs.map(
        (doc) => doc.data().name
      );
      setCategories(catList);
    };

    fetchData();
  }, []);

  const handleRecord = async () => {
    if (!auth.currentUser || !amount || !selectedCategory || !selectedAccount)
      return;
    const userId = auth.currentUser.uid;
    const recordsRef = collection(db, "records", userId, "items");

    const type = selectedType === "expense" ? "支出" : "收入";
    const newAmount = parseInt(amount);

    await addDoc(recordsRef, {
      type,
      amount: newAmount,
      detail,
      category: selectedCategory,
      account: selectedAccount,
      date: new Date().toISOString().slice(0, 10),
    });

    const accountRef = doc(
      db,
      "accounts",
      userId,
      "userAccounts",
      selectedAccount
    );
    const newBalance =
      (balance[selectedAccount] ?? 0) +
      (selectedType === "income" ? newAmount : -newAmount);

    await updateDoc(accountRef, { balance: newBalance });

    setBalance((prev) => ({
      ...prev,
      [selectedAccount]: newBalance,
    }));

    setAmount("");
    setDetail("");
    setSelectedCategory("");
    setSelectedAccount("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">今日總覽（商業版）</h1>

      <Card>
        <CardContent className="p-6 space-y-2">
          <div>
            總餘額：${Object.values(balance).reduce((acc, cur) => acc + cur, 0)}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(balance).map(([name, amt]) => (
              <div key={name}>
                {name}：${amt}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">快速記帳</h2>

      <Tabs
        defaultValue="expense"
        className="w-full"
        onValueChange={(val: "expense" | "income") => setSelectedType(val)}
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="expense">支出</TabsTrigger>
          <TabsTrigger value="income">收入</TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Input
                placeholder="支出金額"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="詳細內容（選填）"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇帳戶" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleRecord}>
                記錄支出
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardContent className="p-4 space-y-2">
              <Input
                placeholder="收入金額"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="收入來源" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="詳細內容（選填）"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="存入帳戶" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleRecord}>
                記錄收入
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
