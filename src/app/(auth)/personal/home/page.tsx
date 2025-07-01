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
import { collection, getDocs } from "firebase/firestore";
import { useHandleRecord } from "@/hooks/useHandleRecord";

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

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;

      // 讀取帳戶
      const accountsRef = collection(db, "users", userId, "accounts");
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

      // 讀取限額設定
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
    };

    fetchData();
  }, []);

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

  const handleRecord = useHandleRecord({ mode: "personal", limits, setLimits });

  const onRecord = async () => {
    const acc = accounts.find((a) => a.name === selectedAccount);
    if (!acc) return;

    await handleRecord({
      selectedType,
      amount,
      selectedAccount,
      currentBalance: acc.balance,
      updateLocalBalance: (newBalance) =>
        setAccounts((prev) =>
          prev.map((a) =>
            a.name === selectedAccount ? { ...a, balance: newBalance } : a
          )
        ),
    });

    setAmount("");
    setSelectedAccount("");
  };

  return (
    <div className="p-6 space-y-6">
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
                    {limit.account}限額追蹤（{limit.startDate} ~{" "}
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
        onValueChange={(val) => setSelectedType(val as "expense" | "income")}
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
              <Button className="w-full" onClick={onRecord}>
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
              <Button className="w-full" onClick={onRecord}>
                記錄收入
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
