import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const sperreId = parseInt(idStr);
    const body = await request.json();
    const { mfaId } = body;

    if (isNaN(sperreId)) return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });

    const mfa = await prisma.mfa.findUnique({ where: { id: mfaId } });
    if (!mfa || mfa.berechtigungsstufe !== "erweitert") {
      return NextResponse.json({ error: "Nur leitende MFAs können Sperren aufheben" }, { status: 403 });
    }

    const sperre = await prisma.patientensperre.findUnique({ where: { id: sperreId } });
    if (!sperre) return NextResponse.json({ error: "Sperre nicht gefunden" }, { status: 404 });

    await prisma.patientensperre.update({
      where: { id: sperreId },
      data: { status: "aufgehoben", aufgehobenAm: new Date(), aufgehobenDurch: mfaId },
    });

    await prisma.patient.update({
      where: { id: sperre.patientId },
      data: { sperrstatus: "aktiv", noShowZaehler: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sperre-aufheben-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
