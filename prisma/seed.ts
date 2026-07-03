import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Ärzt:innen
  const demir = await prisma.arzt.create({
    data: {
      name: "Dr. Aylin Demir",
      rolle: "inhaberin",
      besondereSchwerpunkte: "Reisemedizin",
    },
  });

  await prisma.arzt.create({
    data: {
      name: "Dr. Yilmaz",
      rolle: "aerztin",
    },
  });

  await prisma.arzt.create({
    data: {
      name: "Dr. Schäfer",
      rolle: "aerztin",
    },
  });

  // MFAs
  await prisma.mfa.createMany({
    data: [
      { name: "MFA 1", rolle: "leitende_mfa", berechtigungsstufe: "erweitert" },
      { name: "MFA 2", rolle: "mfa" },
      { name: "MFA 3", rolle: "mfa" },
      { name: "MFA 4", rolle: "mfa" },
    ],
  });

  // Terminarten
  await prisma.terminart.createMany({
    data: [
      { name: "Vorsorge", defaultDauerMin: 20, onlineBuchbar: true, vorausbuchbar: true, brauchtArzt: true, brauchtMfa: false, triageErforderlich: false },
      { name: "Beratung", defaultDauerMin: 15, onlineBuchbar: true, vorausbuchbar: true, brauchtArzt: true, brauchtMfa: false, triageErforderlich: false },
      { name: "Impfung", defaultDauerMin: 15, onlineBuchbar: true, vorausbuchbar: true, brauchtArzt: true, brauchtMfa: false, triageErforderlich: false },
      { name: "Wiederholungsrezept-Abholung", defaultDauerMin: 5, onlineBuchbar: true, vorausbuchbar: true, brauchtArzt: false, brauchtMfa: true, triageErforderlich: false },
      { name: "Akutsprechstunde", defaultDauerMin: 10, onlineBuchbar: false, vorausbuchbar: false, brauchtArzt: true, brauchtMfa: true, triageErforderlich: true },
      { name: "Erstgespräch", defaultDauerMin: 30, onlineBuchbar: false, vorausbuchbar: false, brauchtArzt: true, brauchtMfa: false, triageErforderlich: true },
      { name: "Blutabnahme", defaultDauerMin: 10, onlineBuchbar: false, vorausbuchbar: false, brauchtArzt: false, brauchtMfa: true, triageErforderlich: false },
    ],
  });

  // Sprechzeiten für Dr. Demir (Mo–Fr 8:00–16:00)
  for (let tag = 1; tag <= 5; tag++) {
    await prisma.sprechzeit.create({
      data: { arztId: demir.id, tag, startzeit: "08:00", endzeit: "16:00" },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
