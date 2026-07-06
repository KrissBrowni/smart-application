import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, geburtsdatum, telefonnummer, medikament } = body;

    if (!patientName || !geburtsdatum || !medikament) {
      return NextResponse.json({ error: "Name, Geburtsdatum und Medikament sind Pflicht" }, { status: 400 });
    }

    // Patient finden oder anlegen
    let patient = await prisma.patient.findFirst({
      where: { name: patientName, geburtsdatum: new Date(geburtsdatum + "T00:00:00Z") },
    });

    if (!patient) {
      const newCode = 'PAT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      patient = await prisma.patient.create({
        data: {
          patientCode: newCode,
          name: patientName,
          geburtsdatum: new Date(geburtsdatum + "T00:00:00Z"),
          telefonnummer: telefonnummer || "",
          versicherungsstatus: "gesetzlich",
        },
      });
    }

    // Prüfen: Wiederholungsrezept-Sperre (frühestens ab)
    const letzteAnfrage = await prisma.rezeptanfrage.findFirst({
      where: { patientId: patient.id, status: { in: ["freigegeben", "benachrichtigt"] } },
      orderBy: { angefragtAm: "desc" },
    });

    if (letzteAnfrage?.fruehestensAb && new Date(letzteAnfrage.fruehestensAb) > new Date()) {
      return NextResponse.json({
        error: `Wiederholungsrezept frühestens ab ${letzteAnfrage.fruehestensAb.toISOString().split("T")[0]} möglich`,
      }, { status: 429 });
    }

    // Rezeptanfrage anlegen
    const anfrage = await prisma.rezeptanfrage.create({
      data: {
        patientId: patient.id,
        medikamentReferenz: medikament,
        status: "eingegangen",
      },
    });

    return NextResponse.json({ success: true, anfrageId: anfrage.id }, { status: 201 });
  } catch (error) {
    console.error("Rezeptanfrage-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
