import { describe, it, expect } from "vitest";
import {
  ueberlappt,
  istWochenende,
  noShowSperrePruefen,
  generierePin,
  darfOnlineBuchen,
  mfaDarfSperreAufheben,
  berechneEndzeit,
  passwortGueltig,
} from "../lib/business-logic";

// ============================================
// 1. Zeitbereichs-Überlappung
// ============================================
describe("ueberlappt()", () => {
  it("erkennt überlappende Zeitfenster", () => {
    expect(ueberlappt("09:00", "09:20", "09:10", "09:30")).toBe(true);
    expect(ueberlappt("09:00", "09:20", "08:50", "09:10")).toBe(true);
    expect(ueberlappt("09:00", "09:20", "09:00", "09:20")).toBe(true);
  });

  it("erkennt nicht überlappende Zeitfenster", () => {
    expect(ueberlappt("09:00", "09:20", "09:20", "09:40")).toBe(false);
    expect(ueberlappt("09:20", "09:40", "09:00", "09:20")).toBe(false);
    expect(ueberlappt("09:00", "09:15", "09:15", "09:30")).toBe(false);
  });

  it("erkennt Überlappung bei unterschiedlichen Dauern", () => {
    // 5-Min-Slot liegt innerhalb 20-Min-Slot
    expect(ueberlappt("09:00", "09:20", "09:05", "09:10")).toBe(true);
    // 20-Min-Slot überlappt teilweise mit 5-Min-Slot
    expect(ueberlappt("09:05", "09:10", "09:00", "09:20")).toBe(true);
  });
});

// ============================================
// 2. Wochenende
// ============================================
describe("istWochenende()", () => {
  it("erkennt Samstag (2026-07-25 = Samstag)", () => {
    expect(istWochenende("2026-07-25")).toBe(true);
  });

  it("erkennt Sonntag (2026-07-26 = Sonntag)", () => {
    expect(istWochenende("2026-07-26")).toBe(true);
  });

  it("erkennt Werktag (2026-07-22 = Mittwoch)", () => {
    expect(istWochenende("2026-07-22")).toBe(false);
  });

  it("erkennt Freitag als Werktag (2026-07-24)", () => {
    expect(istWochenende("2026-07-24")).toBe(false);
  });
});

// ============================================
// 3. No-Show-Sperre
// ============================================
describe("noShowSperrePruefen()", () => {
  it("sperrt bei genau 3 No-Shows", () => {
    expect(noShowSperrePruefen(3)).toBe(true);
  });

  it("sperrt bei mehr als 3 No-Shows", () => {
    expect(noShowSperrePruefen(5)).toBe(true);
  });

  it("sperrt nicht bei 2 No-Shows", () => {
    expect(noShowSperrePruefen(2)).toBe(false);
  });

  it("sperrt nicht bei 0 No-Shows", () => {
    expect(noShowSperrePruefen(0)).toBe(false);
  });
});

// ============================================
// 4. Online-Buchung
// ============================================
describe("darfOnlineBuchen()", () => {
  it("erlaubt Buchung bei aktivem Status", () => {
    expect(darfOnlineBuchen("aktiv")).toBe(true);
  });

  it("erlaubt Buchung bei gewarntem Status", () => {
    expect(darfOnlineBuchen("gewarnt")).toBe(true);
  });

  it("blockiert Buchung bei online_gesperrt", () => {
    expect(darfOnlineBuchen("online_gesperrt")).toBe(false);
  });
});

// ============================================
// 5. MFA-Berechtigung
// ============================================
describe("mfaDarfSperreAufheben()", () => {
  it("erlaubt erweiterten MFAs", () => {
    expect(mfaDarfSperreAufheben("erweitert")).toBe(true);
  });

  it("blockiert Standard-MFAs", () => {
    expect(mfaDarfSperreAufheben("standard")).toBe(false);
  });

  it("blockiert unbekannte Berechtigungen", () => {
    expect(mfaDarfSperreAufheben("")).toBe(false);
  });
});

// ============================================
// 6. Endzeit-Berechnung
// ============================================
describe("berechneEndzeit()", () => {
  it("berechnet 20 Minuten ab 09:00", () => {
    expect(berechneEndzeit("09:00", 20)).toBe("09:20");
  });

  it("berechnet 15 Minuten ab 10:45", () => {
    expect(berechneEndzeit("10:45", 15)).toBe("11:00");
  });

  it("berechnet Stundengrenze korrekt", () => {
    expect(berechneEndzeit("09:50", 20)).toBe("10:10");
  });
});

// ============================================
// 7. Passwort-Gültigkeit
// ============================================
describe("passwortGueltig()", () => {
  it("akzeptiert 4-stelligen PIN", () => {
    expect(passwortGueltig("1234")).toBe(true);
  });

  it("akzeptiert langes Passwort", () => {
    expect(passwortGueltig("mein-passwort-2026")).toBe(true);
  });

  it("lehnt zu kurzes Passwort ab", () => {
    expect(passwortGueltig("123")).toBe(false);
  });

  it("lehnt leeres Passwort ab", () => {
    expect(passwortGueltig("")).toBe(false);
  });

  it("lehnt zu langes Passwort ab", () => {
    expect(passwortGueltig("a".repeat(21))).toBe(false);
  });
});

// ============================================
// 8. PIN-Generierung
// ============================================
describe("generierePin()", () => {
  it("generiert 4-stelligen PIN", () => {
    const pin = generierePin();
    expect(pin).toMatch(/^\d{4}$/);
  });

  it("generiert unterschiedliche PINs", () => {
    const pins = new Set(Array.from({ length: 10 }, () => generierePin()));
    expect(pins.size).toBeGreaterThan(1);
  });
});
