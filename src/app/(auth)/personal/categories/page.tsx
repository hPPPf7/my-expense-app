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

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      if (!auth.currentUser) return;
      const categoriesRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "categories"
      );
      const snapshot = await getDocs(categoriesRef);
      const categoryList = snapshot.docs.map((doc) => doc.data().name);
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !auth.currentUser) return;
    const categoriesRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "categories"
    );
    await addDoc(categoriesRef, { name: newCategory.trim() });
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory("");
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!auth.currentUser) return;
    const categoriesRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "categories"
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
      <h1 className="text-2xl font-bold">分類管理</h1>

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
