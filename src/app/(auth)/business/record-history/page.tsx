"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, isToday, subDays, isAfter } from "date-fns";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";

const filters = ["今天", "最近7天", "最近30天"];
const defaultBusinessCategories = [
  "銷售收入",
  "進貨成本",
  "人事費用",
  "廣告行銷",
  "租金水電",
  "稅金費用",
  "其他收入",
  "其他支出",
];

interface RecordItem {
  id: string;
  type: string;
  category: string;
  detail: string;
  account: string;
  amount: number;
  date: string;
}

export default function BusinessRecordHistoryPage() {
  const [selectedFilter, setSelectedFilter] = useState("今天");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [editItem, setEditItem] = useState<RecordItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;

      // 讀取帳戶
      const accountsRef = collection(db, "accounts", userId, "userAccounts");
      const accountsSnap = await getDocs(accountsRef);
      const accountList = accountsSnap.docs.map((doc) => doc.data().name);
      setAccounts(accountList.length ? accountList : ["現金"]);

      // 讀取商業分類
      const categoriesRef = collection(
        db,
        "business-categories",
        userId,
        "userCategories"
      );
      const categoriesSnap = await getDocs(categoriesRef);
      if (categoriesSnap.empty) {
        // 如果沒有分類，新增預設
        for (const cat of defaultBusinessCategories) {
          const newCatRef = doc(categoriesRef, cat);
          await setDoc(newCatRef, { name: cat });
        }
        setCategories(defaultBusinessCategories);
      } else {
        const catList = categoriesSnap.docs.map((doc) => doc.data().name);
        setCategories(catList);
      }

      // 讀取商業記帳紀錄
      const recordsRef = collection(db, "business-records", userId, "items");
      const q = query(recordsRef, orderBy("date", "desc"));
      const recordsSnap = await getDocs(q);
      const recordList = recordsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RecordItem[];
      setRecords(recordList);
    };

    fetchData();
  }, []);

  const today = new Date();
  const filtered = records.filter((r) => {
    const recordDate = new Date(r.date);
    const inTimeRange =
      selectedFilter === "今天"
        ? isToday(recordDate)
        : isAfter(
            recordDate,
            subDays(today, selectedFilter === "最近7天" ? 7 : 30)
          );
    const inCategory =
      selectedCategory === "全部" || r.category === selectedCategory;
    return inTimeRange && inCategory;
  });

  const groupedByDate = filtered.reduce(
    (acc: Record<string, RecordItem[]>, curr) => {
      if (!acc[curr.date]) acc[curr.date] = [];
      acc[curr.date].push(curr);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const handleSaveEdit = async () => {
    if (!editItem || !auth.currentUser) return;

    const recordRef = doc(
      db,
      "business-records",
      auth.currentUser.uid,
      "items",
      editItem.id
    );
    await updateDoc(recordRef, {
      detail: editItem.detail,
      amount: editItem.amount,
      category: editItem.category,
      account: editItem.account,
    });

    setRecords((prev) =>
      prev.map((r) => (r.id === editItem.id ? editItem : r))
    );
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!editItem || !auth.currentUser) return;

    const recordRef = doc(
      db,
      "business-records",
      auth.currentUser.uid,
      "items",
      editItem.id
    );
    await deleteDoc(recordRef);

    setRecords((prev) => prev.filter((r) => r.id !== editItem.id));
    setEditItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">商業記帳紀錄</h1>

      <div className="flex gap-2">
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="選擇時間" />
          </SelectTrigger>
          <SelectContent>
            {filters.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="選擇分類" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">
              {format(new Date(date), "yyyy-MM-dd")}
            </div>
            {groupedByDate[date].map((item) => (
              <Card
                key={item.id}
                className="border-l-4"
                style={{
                  borderColor: item.type === "支出" ? "#f87171" : "#34d399",
                }}
              >
                <CardContent className="p-3 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {item.type} - {item.category}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.detail} ・{item.account}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {item.type === "支出" ? "-" : "+"}${item.amount}
                      </div>
                    </div>
                  </div>
                  <div className="text-right pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditItem(item)}
                        >
                          編輯
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>編輯紀錄</DialogTitle>
                        {editItem && (
                          <div className="space-y-2">
                            <Input
                              value={editItem.detail}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  detail: e.target.value,
                                })
                              }
                              placeholder="詳細內容"
                            />
                            <Input
                              type="number"
                              value={editItem.amount}
                              onChange={(e) =>
                                setEditItem({
                                  ...editItem,
                                  amount: parseInt(e.target.value),
                                })
                              }
                              placeholder="金額"
                            />
                            <Select
                              value={editItem.category}
                              onValueChange={(val) =>
                                setEditItem({ ...editItem, category: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="分類" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={editItem.account}
                              onValueChange={(val) =>
                                setEditItem({ ...editItem, account: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="帳戶" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((acc) => (
                                  <SelectItem key={acc} value={acc}>
                                    {acc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex justify-between pt-2">
                              <Button
                                variant="destructive"
                                onClick={handleDelete}
                              >
                                刪除
                              </Button>
                              <Button onClick={handleSaveEdit}>儲存變更</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
