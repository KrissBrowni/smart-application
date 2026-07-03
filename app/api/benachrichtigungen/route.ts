import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  const where: any = {};
  if (patientCode) {
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (patient) where.patientId = patient.id;
    else return NextResponse.json({ benachrichtigungen: [] });
  }

  const benachrichtigungen = await prisma.benachrichtigung.findMany({
    where,
    include: { patient: { select: { id: true, name: true, patientCode: true } } },
    orderBy: { erstelltAm: "desc" },
    take: 100,
  });

  return NextResponse.json({ benachrichtigungen });
}
