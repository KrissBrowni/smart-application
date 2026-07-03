import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Opt-In-Status abrufen
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  if (!patientCode) {
    return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { patientCode: patientCode.toUpperCase() },
    select: {
      id: true,
      name: true,
      email: true,
      emailOptIn: true,
      smsOptIn: true,
      einwilligungen: {
        select: { id: true, zweck: true, kanal: true, status: true, erteiltAm: true },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

// PATCH: Opt-In-Status aktualisieren
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, smsOptIn, emailOptIn, email } = body;

    if (!patientCode) {
      return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    const updateData: any = {};
    if (smsOptIn !== undefined) updateData.smsOptIn = smsOptIn;
    if (emailOptIn !== undefined) updateData.emailOptIn = emailOptIn;
    if (email !== undefined) updateData.email = email;

    await prisma.patient.update({ where: { id: patient.id }, data: updateData });

    // Einwilligungen dokumentieren
    if (smsOptIn !== undefined) {
      await prisma.einwilligung.create({
        data: {
          patientId: patient.id,
          zweck: "sms_erinnerung",
          kanal: "sms",
          status: smsOptIn ? "erteilt" : "widerrufen",
          erteiltAm: smsOptIn ? new Date() : undefined,
          widerrufenAm: smsOptIn ? undefined : new Date(),
        },
      });
    }

    if (emailOptIn !== undefined) {
      await prisma.einwilligung.create({
        data: {
          patientId: patient.id,
          zweck: "email_erinnerung",
          kanal: "email",
          status: emailOptIn ? "erteilt" : "widerrufen",
          erteiltAm: emailOptIn ? new Date() : undefined,
          widerrufenAm: emailOptIn ? undefined : new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Opt-In-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
