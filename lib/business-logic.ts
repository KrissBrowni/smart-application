// Reine Business-Logik (testbar ohne Datenbank)

/** Prüft, ob sich zwei Zeitfenster überlappen */
export function ueberlappt(
  startA: string, endA: string,
  startB: string, endB: string
): boolean {
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const aStart = toMin(startA);
  const aEnd = toMin(endA);
  const bStart = toMin(startB);
  const bEnd = toMin(endB);
  return aStart < bEnd && aEnd > bStart;
}

/** Prüft, ob ein Datum auf ein Wochenende fällt */
export function istWochenende(datumStr: string): boolean {
  const tag = new Date(datumStr + "T00:00:00Z").getUTCDay();
  return tag === 0 || tag === 6;
}

/** Prüft, ob nach einem No-Show eine Sperre aktiviert werden muss */
export function noShowSperrePruefen(noShowZaehler: number): boolean {
  return noShowZaehler >= 3;
}

/** Generiert einen 4-stelligen PIN */
export function generierePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Prüft, ob ein Patient online buchen darf */
export function darfOnlineBuchen(sperrstatus: string): boolean {
  return sperrstatus !== "online_gesperrt";
}

/** Prüft, ob eine MFA eine Sperre aufheben darf */
export function mfaDarfSperreAufheben(berechtigungsstufe: string): boolean {
  return berechtigungsstufe === "erweitert";
}

/** Berechnet Endzeit aus Startzeit + Dauer */
export function berechneEndzeit(startzeit: string, dauerMin: number): string {
  const [h, m] = startzeit.split(":").map(Number);
  const endMin = h * 60 + m + dauerMin;
  return `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
}

/** Prüft Passwort-Komplexität */
export function passwortGueltig(passwort: string): boolean {
  return passwort.length >= 4 && passwort.length <= 20;
}
