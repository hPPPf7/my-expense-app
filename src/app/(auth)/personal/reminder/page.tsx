"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, differenceInCalendarDays } from "date-fns";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function ReminderPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchReminders = async () => {
      if (!auth.currentUser) return;

      const remindersRef = collection(
        db,
        "reminders",
        auth.currentUser.uid,
        "items"
      );
      const q = query(remindersRef, orderBy("date"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReminders(data);
    };

    fetchReminders();
  }, []);

  const addReminder = async () => {
    if (!text || !date || !auth.currentUser) return;

    const remindersRef = collection(
      db,
      "reminders",
      auth.currentUser.uid,
      "items"
    );
    const docRef = await addDoc(remindersRef, {
      text,
      date,
    });

    setReminders((prev) => [...prev, { id: docRef.id, text, date }]);

    setText("");
    setDate("");
  };

  const deleteReminder = async (id: string) => {
    if (!auth.currentUser) return;

    const reminderDoc = doc(db, "reminders", auth.currentUser.uid, "items", id);
    await deleteDoc(reminderDoc);

    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const getCountdownText = (dateStr: string) => {
    const days = differenceInCalendarDays(new Date(dateStr), new Date());
    if (days < 0) return "已過期";
    if (days === 0) return "今天";
    return `剩下 ${days} 天`;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">📅 續費／帳單提醒</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="提醒項目"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button onClick={addReminder}>新增提醒</Button>
      </div>

      <div className="space-y-2">
        {reminders.map((item) => (
          <Card
            key={item.id}
            className="border-l-4"
            style={{
              borderColor:
                differenceInCalendarDays(new Date(item.date), new Date()) < 0
                  ? "#f87171"
                  : "#60a5fa",
            }}
          >
            <CardContent className="p-4 flex justify-between items-center text-sm">
              <div>
                <div className="font-medium">{item.text}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(item.date), "yyyy-MM-dd")} ・
                  {getCountdownText(item.date)}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteReminder(item.id)}
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
