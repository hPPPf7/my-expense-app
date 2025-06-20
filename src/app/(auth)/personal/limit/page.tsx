"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInCalendarDays } from "date-fns";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const LOCAL_KEY = "limit-config";

export default function LimitPage() {
  const [limit, setLimit] = useState({
    amount: 3000,
    days: 14,
    start: "",
    active: false,
  });

  const [spent, setSpent] = useState(0);

  // 讀取 Firestore
  useEffect(() => {
    const fetchLimit = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "limits", auth.currentUser.uid);
        const userLimit = await getDoc(userDocRef);

        if (userLimit.exists()) {
          setLimit(userLimit.data() as any);
        }
      }
    };

    fetchLimit();
  }, []);

  // 當限額設定變動時，寫入 Firestore
  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "limits", auth.currentUser.uid);
      setDoc(userDocRef, limit, { merge: true });
    }
  }, [limit]);

  const activate = () => {
    const today = new Date().toISOString().split("T")[0];
    setLimit((prev) => ({ ...prev, active: true, start: today }));
    setSpent(0); // 預設為 0，未來可整合實際支出
  };

  const remaining = limit.amount - spent;
  const endDate = limit.start
    ? format(
        new Date(new Date(limit.start).getTime() + limit.days * 86400000),
        "yyyy-MM-dd"
      )
    : "--";

  const daysLeft = limit.start
    ? differenceInCalendarDays(
        new Date(limit.start).getTime() + limit.days * 86400000,
        new Date()
      )
    : 0;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">限額設定</h1>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div>
            帳戶限額：每 {limit.days} 天 ${limit.amount}
          </div>
          <div>剩餘金額：${remaining}</div>
          <div>
            起始日：{limit.start || "--"} ・ 結束日：{endDate} ・ 剩餘天數：
            {daysLeft} 天
          </div>
          {!limit.active && (
            <Button className="mt-2" onClick={activate}>
              啟動限額
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
