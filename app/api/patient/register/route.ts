import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswort } from "@/lib/password";
import crypto from "crypto";

function generatePatientCode(): string {
  return "PAT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, geburtsdatum, telefonnummer, email } = body;

    if (!name || !geburtsdatum || !telefonnummer) {
      return NextResponse.json({ error: "Name, Geburtsdatum und Telefonnummer sind Pflicht" }, { status: 400 });
    }

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

    let patientCode = '';
    let exists = true;
    while (exists) {
      patientCode = generatePatientCode();
      exists = !!(await prisma.patient.findUnique({ where: { patientCode } }));
    }

    const pin = generatePin();
    const passwortHash = await hashPasswort(pin);

    patient = await prisma.patient.create({
      data: {
        patientCode,
        passwort: passwortHash,
        passwortGeaendert: false,
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
      pin: pin,
      bereitsRegistriert: false,
    }, { status: 201 });
  } catch (error) {
    console.error("Register-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
