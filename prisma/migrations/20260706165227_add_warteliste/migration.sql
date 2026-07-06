-- CreateTable
CREATE TABLE "Warteliste" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,
    "startDatum" DATETIME NOT NULL,
    "endDatum" DATETIME NOT NULL,
    "fruehzeit" TEXT NOT NULL,
    "spaetzeit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'wartet',
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Warteliste_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Warteliste_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "Terminart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
