"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const pieColors = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

interface RecordItem {
  type: string;
  category: string;
  amount: number;
  date: string;
}
interface BarDatum {
  month: string;
  支出: number;
  收入: number;
}

export default function ReportPage() {
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [barData, setBarData] = useState<BarDatum[]>([]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;

      const recordsRef = collection(db, "users", userId, "records");
      const snapshot = await getDocs(recordsRef);

      const data = snapshot.docs.map((doc) => doc.data()) as RecordItem[];
      setRecords(data);

      // 簡單依月份分組的例子
      const monthly: Record<string, { 支出: number; 收入: number }> = {};
      data.forEach((item) => {
        const month = new Date(item.date).getMonth() + 1 + "月";
        if (!monthly[month]) monthly[month] = { 支出: 0, 收入: 0 };
        if (item.type === "支出") {
          monthly[month].支出 += item.amount;
        } else {
          monthly[month].收入 += item.amount;
        }
      });

      const barChartData = Object.entries(monthly).map(([month, value]) => ({
        month,
        ...value,
      }));

      setBarData(barChartData);
    };

    fetchRecords();
  }, []);

  const pieData = records
    .filter((r) => r.type === (tab === "expense" ? "支出" : "收入"))
    .reduce<Record<string, number>>((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieChartData = Object.entries(pieData).map(([category, amount]) => ({
    category,
    amount,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">報表總覽</h1>

      <Tabs
        defaultValue="expense"
        onValueChange={(val) => setTab(val as "expense" | "income")}
      >
        <TabsList>
          <TabsTrigger value="expense">支出分類圓餅圖</TabsTrigger>
          <TabsTrigger value="income">收入分類圓餅圖</TabsTrigger>
        </TabsList>

        <TabsContent value="expense">
          <Card>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <h2 className="text-lg font-semibold mb-2">月度收支長條圖</h2>
        <Card>
          <CardContent className="p-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip cursor={false} />
                  <Bar dataKey="支出" stackId="a" fill="#f87171" />
                  <Bar dataKey="收入" stackId="a" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-12">
                目前沒有可顯示的月度資料
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
