// src/components/HomeOverviewPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Limit {
  id: string;
  account: string;
  startDate: string;
  limit: number;
  spent: number;
}

interface RecordItem {
  type: string;
  amount: number;
  account: string;
  date: string;
  category: string;
  detail: string;
}

interface PanelProps {
  mode: "personal" | "business";
}

export function HomeOverviewPanel({ mode }: PanelProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [selectedType, setSelectedType] = useState<
    "expense" | "income" | "transfer"
  >("expense");
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState<{
    expense: string[];
    income: string[];
  }>({ expense: [], income: [] });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [detail, setDetail] = useState("");

  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;

      const accountsRef = collection(db, "accounts", userId, "userAccounts");
      const accountsSnapshot = await getDocs(accountsRef);
      const accList = accountsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          balance: data.balance ?? 0,
        };
      });
      setAccounts(accList);

      const limitsRef = collection(db, "limits", userId, "items");
      const limitsSnapshot = await getDocs(limitsRef);
      const limitList = limitsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          account: data.account,
          startDate: data.startDate,
          limit: data.limit,
          spent: data.spent ?? 0,
        };
      });
      setLimits(limitList);

      const catCol = mode === "business" ? "business-categories" : "categories";
      const categoriesRef = collection(db, catCol, userId, "userCategories");
      const categoriesSnap = await getDocs(categoriesRef);

      const defaultCats =
        mode === "business"
          ? {
              expense: [
                "進貨成本",
                "人事費用",
                "廣告行銷",
                "租金水電",
                "稅金費用",
                "其他支出",
              ],
              income: ["銷售收入", "其他收入"],
            }
          : {
              expense: [
                "飲食",
                "住家",
                "手機",
                "交通",
                "學習",
                "娛樂",
                "購物",
                "送禮",
                "醫療",
                "保險",
                "其它",
              ],
              income: ["獎金", "工讀", "補助", "生活費", "利息", "中獎"],
            };

      if (categoriesSnap.empty) {
        for (const type of ["expense", "income"] as const) {
          for (const name of defaultCats[type]) {
            const docRef = doc(categoriesRef, name);
            await setDoc(docRef, { name, type });
          }
        }
        setCategories(defaultCats);
      } else {
        const allCats = categoriesSnap.docs.map((doc) => doc.data());
        const income = allCats
          .filter((c) => c.type === "income")
          .map((c) => c.name);
        const expense = allCats
          .filter((c) => c.type === "expense")
          .map((c) => c.name);
        setCategories({ income, expense });
      }
    };
    fetchData();
  }, [mode]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getCountdown = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 13);
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const isLimitActive = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 13);
    return today.getTime() <= end.getTime();
  };

  const handleRecord = async () => {
    if (!amount || !selectedAccount || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const recordDate = today.toISOString().slice(0, 10);

    if (selectedType === "transfer") {
      if (!toAccount || selectedAccount === toAccount) return;
      const transferAmount = parseFloat(amount);
      const transferFee = parseFloat(fee) || 0;

      const transferRecord = {
        from: selectedAccount,
        to: toAccount,
        amount: transferAmount,
        fee: transferFee,
        note,
        date: recordDate,
      };

      await addDoc(
        collection(db, "transfer-records", userId, "records"),
        transferRecord
      );

      const expenseDetail = `轉給 ${toAccount}${
        fee ? `（含手續費 $${fee}）` : ""
      }${note ? `，備註：${note}` : ""}`;
      const incomeDetail = `來自 ${selectedAccount}${
        note ? `，備註：${note}` : ""
      }`;

      await addDoc(collection(db, "records", userId, "items"), {
        type: "支出",
        category: "轉帳支出",
        detail: expenseDetail,
        amount: transferAmount + transferFee,
        account: selectedAccount,
        date: recordDate,
      });

      await addDoc(collection(db, "records", userId, "items"), {
        type: "收入",
        category: "轉帳收入",
        detail: incomeDetail,
        amount: transferAmount,
        account: toAccount,
        date: recordDate,
      });
    } else {
      const recordData: RecordItem = {
        type: selectedType === "expense" ? "支出" : "收入",
        amount: parseInt(amount),
        account: selectedAccount,
        date: recordDate,
        category: selectedCategory,
        detail,
      };

      await addDoc(collection(db, "records", userId, "items"), recordData);

      if (selectedType === "expense") {
        const matchedLimit = limits.find(
          (limit) =>
            limit.account === selectedAccount && isLimitActive(limit.startDate)
        );
        if (matchedLimit) {
          const newSpent = matchedLimit.spent + parseInt(amount);
          setLimits((prev) =>
            prev.map((l) =>
              l.id === matchedLimit.id ? { ...l, spent: newSpent } : l
            )
          );
          await updateDoc(doc(db, "limits", userId, "items", matchedLimit.id), {
            spent: newSpent,
          });
        }
      }
    }

    setAmount("");
    setSelectedAccount("");
    setSelectedCategory("");
    setDetail("");
    setToAccount("");
    setFee("");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">今日總覽</h1>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="text-lg font-semibold">總餘額：${totalBalance}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {accounts.map((acc) => (
              <div key={acc.id}>
                {acc.name}：${acc.balance}
              </div>
            ))}
          </div>
          {limits.length > 0 && (
            <div className="space-y-4 pt-4">
              {limits.map((limit) => (
                <div key={limit.id} className="space-y-2">
                  <div className="text-sm font-medium">
                    {limit.account}限額追蹤（{limit.startDate} ~
                    {new Date(
                      new Date(limit.startDate).getTime() + 13 * 86400000
                    )
                      .toISOString()
                      .slice(0, 10)}
                    ，剩 {getCountdown(limit.startDate)} 天）
                  </div>
                  {isLimitActive(limit.startDate) ? (
                    <>
                      <div className="text-sm">
                        已花費 ${limit.spent} / 限額 ${limit.limit}
                      </div>
                      <Progress value={(limit.spent / limit.limit) * 100} />
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">已到期</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold pt-6">快速記帳</h2>
      <Tabs
        defaultValue="expense"
        className="w-full"
        onValueChange={(val) =>
          setSelectedType(val as "expense" | "income" | "transfer")
        }
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="expense">支出</TabsTrigger>
          <TabsTrigger value="income">收入</TabsTrigger>
          <TabsTrigger value="transfer">轉帳</TabsTrigger>
        </TabsList>

        {selectedType !== "transfer" ? (
          <TabsContent value={selectedType}>
            <Card>
              <CardContent className="p-4 space-y-2">
                <Input
                  placeholder={`${
                    selectedType === "expense" ? "支出" : "收入"
                  }金額`}
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
                    {(selectedType === "expense"
                      ? categories.expense
                      : categories.income
                    ).map((cat) => (
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
                      <SelectItem key={acc.id} value={acc.name}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="w-full" onClick={handleRecord}>
                  {selectedType === "expense" ? "記錄支出" : "記錄收入"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ) : (
          <TabsContent value="transfer">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-col gap-2">
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="轉出帳戶" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.name}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={toAccount} onValueChange={setToAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="轉入帳戶" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.name}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="金額"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Input
                    placeholder="手續費（可選）"
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                  <Input
                    placeholder="備註（可選）"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />

                  <Button
                    className="w-full"
                    onClick={handleRecord}
                    disabled={
                      !selectedAccount ||
                      !toAccount ||
                      selectedAccount === toAccount ||
                      !amount
                    }
                  >
                    轉帳
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
