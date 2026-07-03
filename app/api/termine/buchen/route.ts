import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, geburtsdatum, telefonnummer, email, arztId, terminartId, datum, startzeit } = body;

    // Validierung
    if (!patientName || !geburtsdatum || !telefonnummer || !arztId || !terminartId || !datum || !startzeit) {
      return NextResponse.json({ error: "Alle Pflichtfelder ausfüllen" }, { status: 400 });
    }

    // Terminart prüfen
    const terminart = await prisma.terminart.findUnique({ where: { id: terminartId } });
    if (!terminart || !terminart.onlineBuchbar) {
      return NextResponse.json({ error: "Diese Terminart ist nicht online buchbar" }, { status: 400 });
    }

    // Patient finden oder anlegen
    let patient = await prisma.patient.findFirst({
      where: { name: patientName, geburtsdatum: new Date(geburtsdatum + "T00:00:00Z") },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: patientName,
          geburtsdatum: new Date(geburtsdatum + "T00:00:00Z"),
          telefonnummer,
          email: email || null,
          versicherungsstatus: "gesetzlich",
          emailOptIn: !!email,
          smsOptIn: true,
        },
      });
    }

    // Slot-Daten berechnen
    const [startH, startM] = startzeit.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = startMin + terminart.defaultDauerMin;
    const endzeit = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const terminDatum = new Date(datum + "T00:00:00Z");

    // Kollisionsprüfung
    const kollision = await prisma.termin.findFirst({
      where: {
        arztId,
        terminartId,
        datum: terminDatum,
        startzeit,
        status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
      },
    });

    if (kollision) {
      return NextResponse.json({ error: "Dieser Slot ist bereits belegt" }, { status: 409 });
    }

    // TerminSlot finden oder erzeugen
    let slot = await prisma.terminSlot.findFirst({
      where: { arztId, datum: terminDatum, startzeit, slotTyp: "regulär" },
    });

    if (!slot) {
      slot = await prisma.terminSlot.create({
        data: {
          arztId,
          datum: terminDatum,
          startzeit,
          endzeit,
          slotTyp: "regulär",
          status: "reserviert",
        },
      });
    } else {
      await prisma.terminSlot.update({ where: { id: slot.id }, data: { status: "belegt" } });
    }

    // Termin anlegen
    const termin = await prisma.termin.create({
      data: {
        patientId: patient.id,
        terminartId,
        arztId,
        slotId: slot.id,
        datum: terminDatum,
        startzeit,
        endzeit,
        dauerMinuten: terminart.defaultDauerMin,
        status: "geplant",
        buchungsweg: "online",
      },
    });

    return NextResponse.json({ success: true, terminId: termin.id, patientId: patient.id }, { status: 201 });
  } catch (error) {
    console.error("Buchungsfehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
