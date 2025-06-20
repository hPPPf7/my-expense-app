export function pageTitle(pathname: string) {
  const mapping: Record<string, string> = {
    "/personal/home": "今日總覽 / 快速記帳",
    "/personal/record-history": "記帳紀錄頁",
    "/personal/report": "圖表報表頁",
    "/personal/accounts": "帳戶管理頁",
    "/personal/transfer": "帳戶轉帳頁",
    "/personal/reminder": "續費提醒頁",
    "/personal/balance": "帳戶餘額頁",

    "/business/home": "今日總覽 / 快速記帳",
    "/business/record-history": "記帳紀錄頁",
    "/business/report": "圖表報表頁",
    "/business/reminder": "續費提醒頁",
  };

  return mapping[pathname] ?? "記帳系統";
}
