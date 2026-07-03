import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { arztId, ablehnungsgrund } = body;

    if (isNaN(id)) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }

    const anfrage = await prisma.rezeptanfrage.findUnique({ where: { id } });
    if (!anfrage) {
      return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
    }

    if (ablehnungsgrund) {
      await prisma.rezeptanfrage.update({
        where: { id },
        data: {
          status: "abgelehnt",
          ablehnungsgrund,
          freigegebenDurchArztId: arztId,
        },
      });
      return NextResponse.json({ success: true, status: "abgelehnt" });
    }

    const fruehestensAb = new Date();
    fruehestensAb.setMonth(fruehestensAb.getMonth() + 3);

    await prisma.rezeptanfrage.update({
      where: { id },
      data: {
        status: "freigegeben",
        fruehestensAb,
        freigegebenDurchArztId: arztId,
      },
    });

    await prisma.benachrichtigung.create({
      data: {
        patientId: anfrage.patientId,
        bezugstyp: "rezeptanfrage",
        bezugsId: id,
        kanal: "telefon",
        typ: "rezept_bereit",
        status: "geplant",
      },
    });

    return NextResponse.json({ success: true, status: "freigegeben", fruehestensAb: fruehestensAb.toISOString() });
  } catch (error) {
    console.error("Freigabe-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
