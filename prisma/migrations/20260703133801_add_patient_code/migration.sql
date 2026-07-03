/*
  Warnings:
  - Added the required column `patientCode` to the `Patient` table.
*/

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "patientCode" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "geburtsdatum" DATETIME NOT NULL,
    "versichertennummer" TEXT,
    "praxisPatientennummer" TEXT,
    "versicherungsstatus" TEXT NOT NULL,
    "telefonnummer" TEXT NOT NULL,
    "email" TEXT,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT false,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT false,
    "noShowZaehler" INTEGER NOT NULL DEFAULT 0,
    "sperrstatus" TEXT NOT NULL DEFAULT 'aktiv',
    "angelegtAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Patient" ("patientCode", "angelegtAm", "email", "emailOptIn", "geburtsdatum", "id", "name", "noShowZaehler", "praxisPatientennummer", "smsOptIn", "sperrstatus", "telefonnummer", "versichertennummer", "versicherungsstatus")
SELECT 
  'PAT-' || upper(substr(hex(randomblob(3)), 1, 4)),
  "angelegtAm", "email", "emailOptIn", "geburtsdatum", "id", "name", "noShowZaehler", "praxisPatientennummer", "smsOptIn", "sperrstatus", "telefonnummer", "versichertennummer", "versicherungsstatus"
FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_patientCode_key" ON "Patient"("patientCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
