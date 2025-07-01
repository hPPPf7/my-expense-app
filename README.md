# 我的記帳系統（My Expense App）

這是一個使用 Next.js App Router、TypeScript 與 Firestore 打造的**雙模式記帳應用程式**，支援 **個人** 與 **商業** 模式的記帳功能。

## 功能特色

- 快速新增記帳紀錄，並自動更新帳戶餘額
- 帳戶管理與轉帳功能
- 分類與提醒管理
- 支出限額設定與追蹤
- 圖表報表分析支出與收入
- 個人與商業模式分開運作，互不干擾

## 技術架構

- Next.js（App Router 模式）
- React + TypeScript
- Firebase Firestore

## 開始使用

1. 安裝相依套件：

```bash
npm install
```

2. 設定 Firebase 專案環境變數，請建立 `.env.local` 並參考 `.env.example`。

3. 啟動開發伺服器：

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 就可以開始使用應用程式。
