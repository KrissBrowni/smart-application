import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  if (!patientCode) {
    return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { patientCode: patientCode.toUpperCase() },
    select: { id: true, name: true, bevorzugterArztId: true },
  });

  if (!patient) return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });

  let bevorzugterArzt = null;
  if (patient.bevorzugterArztId) {
    bevorzugterArzt = await prisma.arzt.findUnique({
      where: { id: patient.bevorzugterArztId },
      select: { id: true, name: true },
    });
  }

  const aerzte = await prisma.arzt.findMany({
    where: { aktiv: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ patient: { id: patient.id, name: patient.name, bevorzugterArztId: patient.bevorzugterArztId }, bevorzugterArzt, aerzte });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, arztId } = body;

    if (!patientCode) return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });

    await prisma.patient.update({
      where: { patientCode: patientCode.toUpperCase() },
      data: { bevorzugterArztId: arztId || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Präferenz-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
