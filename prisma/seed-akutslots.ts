import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Akutslots werden angelegt...");
  const today = new Date();
  let count = 0;
  
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const tag = d.getDay();
    if (tag === 0 || tag === 6) continue;
    
    const datumStr = d.toISOString().split("T")[0];
    const datumObj = new Date(datumStr + "T00:00:00Z");
    
    const existing = await prisma.terminSlot.findFirst({
      where: { datum: datumObj, slotTyp: "akut" },
    });
    if (existing) continue;
    
    for (let h = 8; h <= 10; h++) {
      const start = `${String(h).padStart(2, "0")}:00`;
      const end = `${String(h).padStart(2, "0")}:10`;
      
      await prisma.terminSlot.create({
        data: {
          arztId: 1,
          datum: datumObj,
          startzeit: start,
          endzeit: end,
          slotTyp: "akut",
          status: "frei",
          onlineSichtbar: false,
          vorausbuchbar: false,
        },
      });
      count++;
    }
  }
  console.log(`${count} Akutslots angelegt`);
  await prisma.$disconnect();
}

main();
