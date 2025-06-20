"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function LimitTrackerPage() {
  const [account, setAccount] = useState("");
  const [limit, setLimit] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSave = async () => {
    if (!account || !limit || !startDate) {
      alert("請完整填寫！");
      return;
    }

    if (!auth.currentUser) {
      alert("請先登入！");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const limitsRef = collection(db, "limits", userId, "items");

      await addDoc(limitsRef, {
        account,
        limit: parseFloat(limit),
        startDate,
      });

      alert(`✅ 已設定：${account} 兩週限額 $${limit}，開始日期：${startDate}`);

      // 清空輸入欄位
      setAccount("");
      setLimit("");
      setStartDate("");
    } catch (error) {
      console.error("儲存失敗", error);
      alert("❌ 儲存失敗，請稍後再試");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">設定限額追蹤</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>帳戶名稱</Label>
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="例如：郵局"
            />
          </div>

          <div className="space-y-2">
            <Label>限額金額</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="例如：3000"
            />
          </div>

          <div className="space-y-2">
            <Label>開始日期</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSave}>
            儲存設定
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
