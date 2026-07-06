import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, terminartId, startDatum, endDatum, fruehzeit, spaetzeit } = body;

    if (!patientCode || !terminartId || !startDatum || !endDatum) {
      return NextResponse.json({ error: "Patient-Code, Terminart, Start- und Enddatum erforderlich" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (!patient) return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });

    const eintrag = await prisma.warteliste.create({
      data: {
        patientId: patient.id,
        terminartId,
        startDatum: new Date(startDatum + "T00:00:00Z"),
        endDatum: new Date(endDatum + "T00:00:00Z"),
        fruehzeit: fruehzeit || "08:00",
        spaetzeit: spaetzeit || "16:00",
      },
    });

    return NextResponse.json({ success: true, id: eintrag.id }, { status: 201 });
  } catch (error) {
    console.error("Wartelisten-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  const where: any = {};
  if (patientCode) {
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (patient) where.patientId = patient.id;
    else return NextResponse.json({ eintraege: [] });
  }

  const eintraege = await prisma.warteliste.findMany({
    where,
    include: {
      patient: { select: { name: true, patientCode: true, telefonnummer: true } },
      terminart: { select: { name: true } },
    },
    orderBy: { erstelltAm: "desc" },
  });

  return NextResponse.json({ eintraege });
}
