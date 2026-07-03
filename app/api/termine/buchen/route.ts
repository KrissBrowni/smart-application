import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, terminartId, datum, startzeit } = body;

    if (!patientCode || !terminartId || !datum || !startzeit) {
      return NextResponse.json({ error: "Patient-Code, Terminart, Datum und Uhrzeit erforderlich" }, { status: 400 });
    }

    // Patient per Code finden
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (!patient) {
      return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });
    }

    // Sperrstatus prüfen
    if (patient.sperrstatus === "online_gesperrt") {
      return NextResponse.json({ error: "Online-Buchung gesperrt. Bitte kontaktieren Sie die Praxis." }, { status: 403 });
    }

    // Terminart prüfen
    const terminart = await prisma.terminart.findUnique({ where: { id: terminartId } });
    if (!terminart || !terminart.onlineBuchbar) {
      return NextResponse.json({ error: "Diese Terminart ist nicht online buchbar" }, { status: 400 });
    }

    // Slot berechnen
    const [startH, startM] = startzeit.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = startMin + terminart.defaultDauerMin;
    const endzeit = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const terminDatum = new Date(datum + "T00:00:00Z");

    // Kollisionsprüfung
    const kollision = await prisma.termin.findFirst({
      where: {
        arztId: body.arztId || 1,
        terminartId,
        datum: terminDatum,
        startzeit,
        status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
      },
    });

    if (kollision) {
      return NextResponse.json({ error: "Dieser Slot ist bereits belegt" }, { status: 409 });
    }

    // Slot finden oder erzeugen
    let slot = await prisma.terminSlot.findFirst({
      where: { arztId: body.arztId || 1, datum: terminDatum, startzeit, slotTyp: "regulär" },
    });

    if (!slot) {
      slot = await prisma.terminSlot.create({
        data: {
          arztId: body.arztId || 1,
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
        arztId: body.arztId || 1,
        slotId: slot.id,
        datum: terminDatum,
        startzeit,
        endzeit,
        dauerMinuten: terminart.defaultDauerMin,
        status: "geplant",
        buchungsweg: "online",
      },
    });

    // Automatische Benachrichtigung: Termin-Erinnerung
    await prisma.benachrichtigung.create({
      data: {
        patientId: patient.id,
        bezugstyp: "termin",
        bezugsId: termin.id,
        kanal: patient.emailOptIn ? "email" : "sms",
        typ: "erinnerung",
        status: "geplant",
      },
    });

    return NextResponse.json({ success: true, terminId: termin.id }, { status: 201 });
  } catch (error) {
    console.error("Buchungsfehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
