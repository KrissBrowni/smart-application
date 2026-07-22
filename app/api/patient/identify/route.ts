import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, passwort } = body;

    if (!patientCode || !passwort) {
      return NextResponse.json({ error: "Patient-Code und Passwort erforderlich" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { patientCode: patientCode.toUpperCase() },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Passwort prüfen
    if (patient.passwort !== passwort) {
      return NextResponse.json({ error: "Passwort falsch" }, { status: 403 });
    }

    // Sperrstatus prüfen
    if (patient.sperrstatus === "online_gesperrt") {
      return NextResponse.json({ error: "Online-Buchung gesperrt. Bitte kontaktieren Sie die Praxis." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      passwortGeaendert: patient.passwortGeaendert,
      patient: {
        id: patient.id,
        name: patient.name,
        patientCode: patient.patientCode,
        sperrstatus: patient.sperrstatus,
        passwortGeaendert: patient.passwortGeaendert,
      },
    });
  } catch (error) {
    console.error("Identify-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
