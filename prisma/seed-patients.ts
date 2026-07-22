import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Lege Testpatienten an...\n");

  // Bestehende Patienten löschen (optional – nur zum Testen)
  // Achtung: löscht auch abhängige Daten!
  // await prisma.termin.deleteMany();
  // await prisma.noShowEreignis.deleteMany();
  // await prisma.benachrichtigung.deleteMany();
  // await prisma.rezeptanfrage.deleteMany();
  // await prisma.patientensperre.deleteMany();
  // await prisma.einwilligung.deleteMany();
  // await prisma.warteliste.deleteMany();
  // await prisma.patient.deleteMany();

  const aerzte = await prisma.arzt.findMany();
  const terminarten = await prisma.terminart.findMany();

  if (aerzte.length === 0 || terminarten.length === 0) {
    console.log("❌ Bitte zuerst `npx tsx prisma/seed.ts` ausführen (Ärzte + Terminarten anlegen)");
    process.exit(1);
  }

  const demir = aerzte.find(a => a.name.includes("Demir")) || aerzte[0];
  const yilmaz = aerzte.find(a => a.name.includes("Yilmaz")) || aerzte[1];
  const schaefer = aerzte.find(a => a.name.includes("Schäfer")) || aerzte[2] || aerzte[0];

  const vorsorge = terminarten.find(t => t.name === "Vorsorge")!;
  const beratung = terminarten.find(t => t.name === "Beratung")!;
  const impfung = terminarten.find(t => t.name === "Impfung")!;
  const rezept = terminarten.find(t => t.name === "Wiederholungsrezept-Abholung")!;

  // --- Patient 1: Max Mustermann ---
  const max = await prisma.patient.upsert({
    where: { patientCode: "PAT-TEST01" },
    update: {},
    create: {
      patientCode: "PAT-TEST01",
      passwort: "1234",
      passwortGeaendert: true,
      name: "Max Mustermann",
      geburtsdatum: new Date("1990-03-15T00:00:00Z"),
      telefonnummer: "+49 170 1234567",
      email: "max@example.com",
      versicherungsstatus: "gesetzlich",
      emailOptIn: true,
      smsOptIn: true,
      bevorzugterArztId: demir.id,
    },
  });

  // Termin für Max: Vorsorge morgen bei Dr. Demir
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  morgen.setHours(0, 0, 0, 0);
  const morgenStr = morgen.toISOString().split("T")[0];

  await prisma.termin.upsert({
    where: { id: -1 }, // immer neu
    update: {},
    create: {
      patientId: max.id,
      terminartId: vorsorge.id,
      arztId: demir.id,
      slotId: 0,
      datum: morgen,
      startzeit: "09:00",
      endzeit: "09:20",
      dauerMinuten: vorsorge.defaultDauerMin,
      status: "geplant",
      buchungsweg: "online",
    },
  }).catch(() => {}); // ignorieren wenn slotId fehlt

  console.log(`✅ ${max.name} → Code: PAT-TEST01 · PIN: 1234`);

  // --- Patient 2: Erika Schmidt ---
  const erika = await prisma.patient.upsert({
    where: { patientCode: "PAT-TEST02" },
    update: {},
    create: {
      patientCode: "PAT-TEST02",
      passwort: "5678",
      passwortGeaendert: true,
      name: "Erika Schmidt",
      geburtsdatum: new Date("1985-07-22T00:00:00Z"),
      telefonnummer: "+49 176 9876543",
      email: "erika@example.com",
      versicherungsstatus: "privat",
      emailOptIn: true,
      smsOptIn: false,
      bevorzugterArztId: yilmaz.id,
    },
  });

  // Termin für Erika: Beratung morgen bei Dr. Yilmaz
  await prisma.termin.upsert({
    where: { id: -1 },
    update: {},
    create: {
      patientId: erika.id,
      terminartId: beratung.id,
      arztId: yilmaz.id,
      slotId: 0,
      datum: morgen,
      startzeit: "10:00",
      endzeit: "10:15",
      dauerMinuten: beratung.defaultDauerMin,
      status: "geplant",
      buchungsweg: "online",
    },
  }).catch(() => {});

  // Rezeptanfrage für Erika
  await prisma.rezeptanfrage.create({
    data: {
      patientId: erika.id,
      medikamentReferenz: "Ramipril 5mg",
      status: "eingegangen",
    },
  }).catch(() => {});

  console.log(`✅ ${erika.name} → Code: PAT-TEST02 · PIN: 5678`);

  // --- Patient 3: Klaus Weber (mit No-Shows, fast gesperrt) ---
  const klaus = await prisma.patient.upsert({
    where: { patientCode: "PAT-TEST03" },
    update: {},
    create: {
      patientCode: "PAT-TEST03",
      passwort: "0000",
      passwortGeaendert: false,
      name: "Klaus Weber",
      geburtsdatum: new Date("1972-11-08T00:00:00Z"),
      telefonnummer: "+49 163 5551234",
      versicherungsstatus: "gesetzlich",
      emailOptIn: false,
      smsOptIn: true,
      noShowZaehler: 2,
      sperrstatus: "gewarnt",
    },
  });

  console.log(`✅ ${klaus.name} → Code: PAT-TEST03 · PIN: 0000 (Default – muss geändert werden!)`);

  // --- Patient 4: Anna Fischer (gesperrt) ---
  const anna = await prisma.patient.upsert({
    where: { patientCode: "PAT-TEST04" },
    update: {},
    create: {
      patientCode: "PAT-TEST04",
      passwort: "4321",
      passwortGeaendert: true,
      name: "Anna Fischer",
      geburtsdatum: new Date("1995-02-28T00:00:00Z"),
      telefonnummer: "+49 151 2223344",
      email: "anna@example.com",
      versicherungsstatus: "gesetzlich",
      emailOptIn: true,
      smsOptIn: true,
      noShowZaehler: 3,
      sperrstatus: "online_gesperrt",
    },
  });

  // Aktive Sperre für Anna
  await prisma.patientensperre.upsert({
    where: { id: -1 },
    update: {},
    create: {
      patientId: anna.id,
      grund: "drei_no_shows",
      status: "aktiv",
      aktiviertDurch: 0,
    },
  }).catch(() => {});

  console.log(`✅ ${anna.name} → Code: PAT-TEST04 · PIN: 4321 (GESPERRT – 3 No-Shows)`);
  console.log(`   ➔ Zum Testen der Sperre: Einloggen + Termin buchen sollte fehlschlagen`);

  // --- Patient 5: Tobias Klein (mit Impftermin + abgeschlossenem Rezept) ---
  const tobias = await prisma.patient.upsert({
    where: { patientCode: "PAT-TEST05" },
    update: {},
    create: {
      patientCode: "PAT-TEST05",
      passwort: "9999",
      passwortGeaendert: true,
      name: "Tobias Klein",
      geburtsdatum: new Date("2000-06-10T00:00:00Z"),
      telefonnummer: "+49 178 8887776",
      email: "tobias@example.com",
      versicherungsstatus: "privat",
      emailOptIn: true,
      smsOptIn: true,
      bevorzugterArztId: schaefer.id,
    },
  });

  // Vergangener Impftermin (wahrgenommen)
  const gestern = new Date();
  gestern.setDate(gestern.getDate() - 2);
  gestern.setHours(0, 0, 0, 0);

  await prisma.termin.upsert({
    where: { id: -1 },
    update: {},
    create: {
      patientId: tobias.id,
      terminartId: impfung.id,
      arztId: schaefer.id,
      slotId: 0,
      datum: gestern,
      startzeit: "11:00",
      endzeit: "11:15",
      dauerMinuten: impfung.defaultDauerMin,
      status: "wahrgenommen",
      buchungsweg: "telefonisch",
    },
  }).catch(() => {});

  // Freigegebenes Rezept
  await prisma.rezeptanfrage.create({
    data: {
      patientId: tobias.id,
      medikamentReferenz: "L-Thyroxin 50µg",
      status: "benachrichtigt",
      fruehestensAb: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  }).catch(() => {});

  console.log(`✅ ${tobias.name} → Code: PAT-TEST05 · PIN: 9999`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 5 Testpatienten angelegt!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📋 Übersicht:");
  console.log("  PAT-TEST01  Max Mustermann     PIN: 1234   ✅ Termin morgen (Vorsorge)");
  console.log("  PAT-TEST02  Erika Schmidt      PIN: 5678   ✅ Termin morgen + Rezept offen");
  console.log("  PAT-TEST03  Klaus Weber        PIN: 0000   ⚠️ Default-PIN + 2 No-Shows");
  console.log("  PAT-TEST04  Anna Fischer       PIN: 4321   🔒 GESPERRT (3 No-Shows)");
  console.log("  PAT-TEST05  Tobias Klein       PIN: 9999   ✅ Vergangener Termin + Rezept fertig");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
