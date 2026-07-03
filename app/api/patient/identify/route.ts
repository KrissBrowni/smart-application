import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, geburtsdatum } = body;

    if (!patientCode || !geburtsdatum) {
      return NextResponse.json({ error: "Patient-Code und Geburtsdatum erforderlich" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { patientCode: patientCode.toUpperCase() },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Geburtsdatum prüfen
    const gebDatum = new Date(geburtsdatum + "T00:00:00Z");
    if (patient.geburtsdatum.toISOString().split("T")[0] !== gebDatum.toISOString().split("T")[0]) {
      return NextResponse.json({ error: "Geburtsdatum stimmt nicht überein" }, { status: 403 });
    }

    // Sperrstatus prüfen
    if (patient.sperrstatus === "online_gesperrt") {
      return NextResponse.json({ error: "Online-Buchung gesperrt. Bitte kontaktieren Sie die Praxis." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        patientCode: patient.patientCode,
        sperrstatus: patient.sperrstatus,
      },
    });
  } catch (error) {
    console.error("Identify-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
