import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });

    const body = await request.json();
    const { status } = body;

    const upd = await prisma.benachrichtigung.update({
      where: { id },
      data: { status, versendetAm: status === "zugestellt" ? new Date() : undefined },
    });

    return NextResponse.json({ success: true, status: upd.status });
  } catch (error) {
    console.error("Benachrichtigungs-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
