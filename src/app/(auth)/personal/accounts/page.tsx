"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { db, auth } from "@/lib/firebase";
import {
  getDocs,
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<
    { id: string; name: string; balance: number }[]
  >([]);
  const [newAccount, setNewAccount] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [editing, setEditing] = useState<null | {
    id: string;
    name: string;
    balance: number;
  }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (auth.currentUser) {
        const accountsRef = collection(
          db,
          "accounts",
          auth.currentUser.uid,
          "userAccounts"
        );
        const snapshot = await getDocs(accountsRef);
        const accountsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          balance: doc.data().balance ?? 0,
        }));
        setAccounts(accountsList);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const addAccount = async () => {
    if (newAccount && auth.currentUser) {
      const accountsRef = collection(
        db,
        "accounts",
        auth.currentUser.uid,
        "userAccounts"
      );
      const docRef = await addDoc(accountsRef, {
        name: newAccount,
        balance: parseFloat(newBalance) || 0,
      });
      setAccounts((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: newAccount,
          balance: parseFloat(newBalance) || 0,
        },
      ]);
      setNewAccount("");
      setNewBalance("");
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (auth.currentUser) {
      const accountDoc = doc(
        db,
        "accounts",
        auth.currentUser.uid,
        "userAccounts",
        accountId
      );
      await deleteDoc(accountDoc);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    }
  };

  const saveEdit = async () => {
    if (!editing || !auth.currentUser) return;
    const ref = doc(
      db,
      "accounts",
      auth.currentUser.uid,
      "userAccounts",
      editing.id
    );
    await updateDoc(ref, {
      name: editing.name,
      balance: editing.balance,
    });
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === editing.id ? { ...acc, ...editing } : acc))
    );
    setEditing(null); // 關閉彈窗
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">帳戶管理</h1>

      {/* 新增帳戶 */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <Input
          placeholder="帳戶名稱"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
        />
        <Input
          type="number"
          placeholder="初始餘額"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
        />
        <Button onClick={addAccount}>新增帳戶</Button>
      </div>

      {/* 編輯 Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogTitle>編輯帳戶</DialogTitle>
          {editing && (
            <div className="flex flex-col gap-3 pt-2">
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                placeholder="帳戶名稱"
              />
              <Input
                type="number"
                value={editing.balance}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    balance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="餘額"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  取消
                </Button>
                <Button onClick={saveEdit}>儲存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 帳戶列表 */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">載入中...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            您目前沒有任何帳戶，請新增一個帳戶。
          </p>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 text-sm">
                <div className="flex flex-col">
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    餘額：${account.balance}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setEditing(account)}>
                    編輯
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAccount(account.id)}
                  >
                    刪除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
