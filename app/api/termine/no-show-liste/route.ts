import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const termine = await prisma.termin.findMany({
    where: {
      datum: { lte: heute },
      status: { notIn: ["no_show", "abgesagt"] },
    },
    include: {
      patient: { select: { id: true, name: true, noShowZaehler: true, sperrstatus: true, patientCode: true } },
      terminart: { select: { name: true } },
    },
    orderBy: { datum: "desc" },
    take: 50,
  });

  const sperren = await prisma.patientensperre.findMany({
    where: { status: "aktiv" },
    include: { patient: { select: { id: true, name: true, noShowZaehler: true } } },
  });

  return NextResponse.json({ termine, sperren });
}
