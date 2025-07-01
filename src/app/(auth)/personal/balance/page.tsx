"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

interface Account {
  id: string;
  name: string;
  balance: number;
}

export default function BalancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState<string>("");

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const accountsRef = collection(db, "users", userId, "accounts");
      const snapshot = await getDocs(accountsRef);

      const accountList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          balance: data.balance ?? 0,
        };
      });

      setAccounts(accountList);
    };

    fetchAccounts();
  }, []);

  const startEditing = (account: Account) => {
    setEditingId(account.id);
    setEditingBalance(account.balance.toString());
  };

  const saveBalance = async (accountId: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    const accountRef = doc(db, "users", userId, "accounts", accountId);
    const newBalance = parseFloat(editingBalance);

    if (!isNaN(newBalance)) {
      await updateDoc(accountRef, { balance: newBalance });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, balance: newBalance } : acc
        )
      );
    }

    setEditingId(null);
    setEditingBalance("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">💰 帳戶餘額查詢</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                {account.name}
              </div>
              {editingId === account.id ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={editingBalance}
                    onChange={(e) => setEditingBalance(e.target.value)}
                  />
                  <Button size="sm" onClick={() => saveBalance(account.id)}>
                    儲存
                  </Button>
                </div>
              ) : (
                <div
                  className="text-2xl font-semibold cursor-pointer"
                  onClick={() => startEditing(account)}
                >
                  ${account.balance}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
