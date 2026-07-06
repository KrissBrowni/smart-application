import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.warteliste.update({ where: { id: parseInt(id) }, data: { status: "entfernt" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Warteliste-Lösch-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
