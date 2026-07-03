import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET: Alle freien Akutslots an einem Datum
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const datum = searchParams.get("datum") || new Date().toISOString().split("T")[0];

  const slots = await prisma.terminSlot.findMany({
    where: {
      datum: new Date(datum + "T00:00:00Z"),
      slotTyp: "akut",
      status: "frei",
    },
    include: { arzt: { select: { id: true, name: true } } },
    orderBy: { startzeit: "asc" },
  });

  return NextResponse.json({ slots });
}

// POST: Akutslot für Patienten belegen (nur MFA)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, patientName, geburtsdatum, telefonnummer, mfaId } = body;

    if (!slotId || !patientName || !geburtsdatum || !telefonnummer || !mfaId) {
      return NextResponse.json({ error: "Alle Pflichtfelder ausfüllen" }, { status: 400 });
    }

    // MFA prüfen
    const mfa = await prisma.mfa.findUnique({ where: { id: mfaId } });
    if (!mfa || !mfa.aktiv) {
      return NextResponse.json({ error: "Ungültige MFA" }, { status: 403 });
    }

    // Slot prüfen
    const slot = await prisma.terminSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.slotTyp !== "akut" || slot.status !== "frei") {
      return NextResponse.json({ error: "Slot nicht verfügbar" }, { status: 409 });
    }

    // Patient finden oder anlegen
    let patient = await prisma.patient.findFirst({
      where: { name: patientName, geburtsdatum: new Date(geburtsdatum + "T00:00:00Z") },
    });

    if (!patient) {
      let patientCode = `PAT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      let exists = true;
      while (exists) {
        patientCode = `PAT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        exists = !!(await prisma.patient.findUnique({ where: { patientCode } }));
      }
      
      patient = await prisma.patient.create({
        data: {
          patientCode,
          name: patientName,
          geburtsdatum: new Date(geburtsdatum + "T00:00:00Z"),
          telefonnummer,
          versicherungsstatus: "gesetzlich",
        },
      });
    }

    // Slot belegen
    await prisma.terminSlot.update({ where: { id: slotId }, data: { status: "belegt" } });

    // Termin für Akutsprechstunde anlegen
    const terminart = await prisma.terminart.findFirst({ where: { name: "Akutsprechstunde" } });
    if (!terminart) {
      return NextResponse.json({ error: "Terminart Akutsprechstunde nicht gefunden" }, { status: 500 });
    }

    const termin = await prisma.termin.create({
      data: {
        patientId: patient.id,
        terminartId: terminart.id,
        arztId: slot.arztId,
        slotId: slot.id,
        datum: slot.datum,
        startzeit: slot.startzeit,
        endzeit: slot.endzeit,
        dauerMinuten: terminart.defaultDauerMin,
        status: "geplant",
        buchungsweg: "telefonisch",
        interneNotiz: "Akutslot vergeben durch MFA",
      },
    });

    return NextResponse.json({
      success: true,
      terminId: termin.id,
      patientCode: patient.patientCode,
    }, { status: 201 });
  } catch (error) {
    console.error("Akutslot-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
