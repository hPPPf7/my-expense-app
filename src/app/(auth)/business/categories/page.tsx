"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";

// 商業版預設分類
const defaultCategories = [
  "銷售收入",
  "進貨成本",
  "人事費用",
  "廣告行銷",
  "租金水電",
  "稅金費用",
  "其他收入",
  "其他支出",
];

export default function BusinessCategoryManagementPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      if (!auth.currentUser) return;
      const categoriesRef = collection(
        db,
        "business-categories",
        auth.currentUser.uid,
        "userCategories"
      );
      const snapshot = await getDocs(categoriesRef);
      const categoryList = snapshot.docs.map(
        (doc) => doc.data().name
      ) as string[];

      // 如果是第一次登入，且沒有資料，就預設建立初始分類
      if (categoryList.length === 0) {
        for (const name of defaultCategories) {
          await addDoc(categoriesRef, { name });
        }
        setCategories(defaultCategories);
      } else {
        setCategories(categoryList);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !auth.currentUser) return;
    const categoriesRef = collection(
      db,
      "business-categories",
      auth.currentUser.uid,
      "userCategories"
    );
    await addDoc(categoriesRef, { name: newCategory.trim() });
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory("");
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!auth.currentUser) return;
    const categoriesRef = collection(
      db,
      "business-categories",
      auth.currentUser.uid,
      "userCategories"
    );
    const snapshot = await getDocs(categoriesRef);
    const docToDelete = snapshot.docs.find(
      (doc) => doc.data().name === catName
    );
    if (docToDelete) {
      await deleteDoc(doc(categoriesRef, docToDelete.id));
      setCategories((prev) => prev.filter((cat) => cat !== catName));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">商業版｜分類管理</h1>

      <div className="flex gap-2">
        <Input
          placeholder="新增分類"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={handleAddCategory}>新增</Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat}>
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-base">{cat}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCategory(cat)}
              >
                刪除
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
