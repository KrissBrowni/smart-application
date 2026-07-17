import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, terminartId, arztId: arztIdBody, datum, startzeit } = body;
    const arztId = arztIdBody || 1;

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

    // Slot-Zeitraum berechnen
    const [startH, startM] = startzeit.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = startMin + terminart.defaultDauerMin;
    const endzeit = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const terminDatum = new Date(datum + "T00:00:00Z");

    // Kollisionsprüfung – echte Zeitbereichs-Überlappung (alle Terminarten)
    const alleBuchungenAmTag = await prisma.termin.findMany({
      where: {
        arztId,
        datum: terminDatum,
        status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
      },
    });

    for (const b of alleBuchungenAmTag) {
      const [bSH, bSM] = b.startzeit.split(":").map(Number);
      const [bEH, bEM] = b.endzeit.split(":").map(Number);
      const bStart = bSH * 60 + bSM;
      const bEnd = bEH * 60 + bEM;

      // Überlappung: neuer Slot beginnt vor Ende des bestehenden UND endet nach Beginn
      if (startMin < bEnd && endMin > bStart) {
        return NextResponse.json({ error: "Dieser Zeitraum ist bereits belegt" }, { status: 409 });
      }
    }

    // Slot finden oder erzeugen
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
