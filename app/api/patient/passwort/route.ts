import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, altesPasswort, neuesPasswort } = body;

    if (!patientCode || !altesPasswort || !neuesPasswort) {
      return NextResponse.json({ error: "Patient-Code, altes und neues Passwort erforderlich" }, { status: 400 });
    }

    if (neuesPasswort.length < 4 || neuesPasswort.length > 20) {
      return NextResponse.json({ error: "Passwort muss zwischen 4 und 20 Zeichen lang sein" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { patientCode: patientCode.toUpperCase() },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    if (patient.passwort !== altesPasswort) {
      return NextResponse.json({ error: "Altes Passwort falsch" }, { status: 403 });
    }

    await prisma.patient.update({
      where: { patientCode: patientCode.toUpperCase() },
      data: { passwort: neuesPasswort, passwortGeaendert: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Passwort-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
