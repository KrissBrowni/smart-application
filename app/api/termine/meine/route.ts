import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  if (!patientCode) {
    return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
  }

  const termine = await prisma.termin.findMany({
    where: { patientId: patient.id },
    include: {
      terminart: { select: { name: true } },
      arzt: { select: { name: true } },
    },
    orderBy: [{ datum: "desc" }, { startzeit: "asc" }],
  });

  return NextResponse.json({ termine });
}
