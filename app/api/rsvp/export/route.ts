import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { exportRsvpRows } from "@/lib/excel";

export async function GET(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const rows = await exportRsvpRows();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("confirmacoes");
  sheet.columns = [
    { header: "Nome", key: "Nome", width: 30 },
    { header: "Ira ao casamento?", key: "Ira ao casamento?", width: 18 },
    { header: "Numero de pessoas", key: "Numero de pessoas", width: 18 },
    { header: "Data da resposta", key: "Data da resposta", width: 24 },
    { header: "Ultima atualizacao", key: "Ultima atualizacao", width: 24 }
  ];
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="confirmacoes-casamento-lina-janiel.xlsx"'
    }
  });
}
