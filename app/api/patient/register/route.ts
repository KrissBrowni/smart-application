import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generatePatientCode(): string {
  return "PAT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, geburtsdatum, telefonnummer, email } = body;

    if (!name || !geburtsdatum || !telefonnummer) {
      return NextResponse.json({ error: "Name, Geburtsdatum und Telefonnummer sind Pflicht" }, { status: 400 });
    }

    // Prüfen, ob Patient bereits existiert
    let patient = await prisma.patient.findFirst({
      where: { name, geburtsdatum: new Date(geburtsdatum + "T00:00:00Z") },
    });

    if (patient) {
      return NextResponse.json({
        success: true,
        patientCode: patient.patientCode,
        patientId: patient.id,
        bereitsRegistriert: true,
      });
    }

    // Neuen Patienten mit Code anlegen
    let patientCode;
    let exists = true;
    while (exists) {
      patientCode = generatePatientCode();
      exists = !!(await prisma.patient.findUnique({ where: { patientCode } }));
    }

    patient = await prisma.patient.create({
      data: {
        patientCode,
        name,
        geburtsdatum: new Date(geburtsdatum + "T00:00:00Z"),
        telefonnummer,
        email: email || null,
        versicherungsstatus: "gesetzlich",
        emailOptIn: !!email,
        smsOptIn: true,
      },
    });

    return NextResponse.json({
      success: true,
      patientCode: patient.patientCode,
      patientId: patient.id,
      bereitsRegistriert: false,
    }, { status: 201 });
  } catch (error) {
    console.error("Register-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
