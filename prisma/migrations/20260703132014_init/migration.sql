-- CreateTable
CREATE TABLE "Patient" (
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

-- CreateTable
CREATE TABLE "Termin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "terminartId" INTEGER NOT NULL,
    "arztId" INTEGER,
    "slotId" INTEGER NOT NULL,
    "datum" DATETIME NOT NULL,
    "startzeit" TEXT NOT NULL,
    "endzeit" TEXT NOT NULL,
    "dauerMinuten" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "buchungsweg" TEXT NOT NULL,
    "interneNotiz" TEXT,
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storniertAm" DATETIME,
    CONSTRAINT "Termin_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Termin_terminartId_fkey" FOREIGN KEY ("terminartId") REFERENCES "Terminart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Termin_arztId_fkey" FOREIGN KEY ("arztId") REFERENCES "Arzt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Termin_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TerminSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Terminart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "defaultDauerMin" INTEGER NOT NULL,
    "onlineBuchbar" BOOLEAN NOT NULL,
    "vorausbuchbar" BOOLEAN NOT NULL,
    "brauchtArzt" BOOLEAN NOT NULL,
    "brauchtMfa" BOOLEAN NOT NULL,
    "triageErforderlich" BOOLEAN NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Arzt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "verfuegbarkeitsstatus" TEXT NOT NULL DEFAULT 'verfuegbar',
    "besondereSchwerpunkte" TEXT
);

-- CreateTable
CREATE TABLE "Mfa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "berechtigungsstufe" TEXT NOT NULL DEFAULT 'standard'
);

-- CreateTable
CREATE TABLE "TerminSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arztId" INTEGER,
    "datum" DATETIME NOT NULL,
    "startzeit" TEXT NOT NULL,
    "endzeit" TEXT NOT NULL,
    "slotTyp" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'frei',
    "onlineSichtbar" BOOLEAN NOT NULL DEFAULT true,
    "vorausbuchbar" BOOLEAN NOT NULL DEFAULT true,
    "grund" TEXT,
    CONSTRAINT "TerminSlot_arztId_fkey" FOREIGN KEY ("arztId") REFERENCES "Arzt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rezeptanfrage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "medikamentReferenz" TEXT NOT NULL,
    "angefragtAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "fruehestensAb" DATETIME,
    "bearbeitetDurchMfaId" INTEGER,
    "freigegebenDurchArztId" INTEGER,
    "ablehnungsgrund" TEXT,
    "benachrichtigtAm" DATETIME,
    CONSTRAINT "Rezeptanfrage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rezeptanfrage_bearbeitetDurchMfaId_fkey" FOREIGN KEY ("bearbeitetDurchMfaId") REFERENCES "Mfa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Rezeptanfrage_freigegebenDurchArztId_fkey" FOREIGN KEY ("freigegebenDurchArztId") REFERENCES "Arzt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Benachrichtigung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "bezugstyp" TEXT NOT NULL,
    "bezugsId" INTEGER,
    "kanal" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'geplant',
    "erstelltAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versendetAm" DATETIME,
    CONSTRAINT "Benachrichtigung_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoShowEreignis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "terminId" INTEGER NOT NULL,
    "erfasstAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zaehltFuerSperre" BOOLEAN NOT NULL DEFAULT true,
    "kommentar" TEXT,
    CONSTRAINT "NoShowEreignis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NoShowEreignis_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Termin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patientensperre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "grund" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktiv',
    "aktiviertAm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktiviertDurch" INTEGER NOT NULL,
    "aufgehobenAm" DATETIME,
    "aufgehobenDurch" INTEGER,
    CONSTRAINT "Patientensperre_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Einwilligung" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "zweck" TEXT NOT NULL,
    "kanal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "erteiltAm" DATETIME,
    "widerrufenAm" DATETIME,
    "datenschutzhinweisVersion" TEXT,
    CONSTRAINT "Einwilligung_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Abwesenheitsereignis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arztId" INTEGER,
    "typ" TEXT NOT NULL,
    "startDatum" DATETIME NOT NULL,
    "endDatum" DATETIME NOT NULL,
    "betrifftGanzePraxis" BOOLEAN NOT NULL DEFAULT false,
    "grund" TEXT,
    CONSTRAINT "Abwesenheitsereignis_arztId_fkey" FOREIGN KEY ("arztId") REFERENCES "Arzt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wochenbericht" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kalenderwoche" INTEGER NOT NULL,
    "jahr" INTEGER NOT NULL,
    "onlineBuchungsquote" REAL NOT NULL,
    "noShowRateProArzt" TEXT NOT NULL,
    "akutslotAuslastung" REAL NOT NULL,
    "offeneRezeptanfragen" INTEGER NOT NULL,
    "durchschnittlicheLiegezeit" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Sprechzeit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arztId" INTEGER NOT NULL,
    "tag" INTEGER NOT NULL,
    "startzeit" TEXT NOT NULL,
    "endzeit" TEXT NOT NULL,
    CONSTRAINT "Sprechzeit_arztId_fkey" FOREIGN KEY ("arztId") REFERENCES "Arzt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NoShowEreignis_terminId_key" ON "NoShowEreignis"("terminId");
