# KALIBRIERUNG — Praxis Demir & Kollegen

## 1. Business Rule: Sperre nach No-Shows (automatisch)

**Aussage:**  
Nach dem dritten No-Show-Ereignis eines Patienten wird der Sperrstatus automatisch auf `"online_gesperrt"` gesetzt und eine Patienten-Sperre angelegt.

**Konfidenz: 10**

**Wie geprüft?**  
In `app/api/termine/[id]/no-show/route.ts` wird nach Erhöhung des `noShowZaehlers` geprüft: `if (patient.noShowZaehler >= 3)` → `sperrstatus = "online_gesperrt"` + `patientensperre.create`.

---

## 2. Business Rule: Online-Buchung nur innerhalb der Sprechzeiten

**Aussage:**  
Die App erlaubt Online-Buchungen nur innerhalb der hinterlegten Sprechzeiten der Ärzt:innen und blockiert Buchungen am Wochenende sowie bei Praxisschließungen.

**Konfidenz: 10**

**Wie geprüft?**  
In `app/api/termine/verfuegbarkeit/route.ts` wird `isWeekend` geprüft, eine Praxisschließungs-Abfrage gemacht, und für jeden Arzt werden nur Slots innerhalb seiner `sprechzeiten` generiert.

---

## 3. Datenmodell (n:m): Patient und Ärzt:in über Termine

**Aussage:**  
Patienten und Ärzt:innen sind über eine n:m-Beziehung verknüpft, vermittelt durch die Entität `Termin`, die beide Seiten referenziert.

**Konfidenz: 10**

**Wie geprüft?**  
`Patient` hat `Termin[]`, `Termin` hat `patientId` und `arztId`. Ein Patient kann mehrere Ärzt:innen haben, eine Ärztin mehrere Patienten — die n:m-Relation wird durch `Termin` aufgelöst.

---

## 4. Widerspruchsauflösung: Doppelbuchung verhindern (Slot-Kollisionsprüfung)

**Aussage:**  
Widersprüchliche Doppelbuchungen desselben Slots werden durch Kollisionsprüfung in `PATCH /api/termine/[id]/umbuchen` und `POST /api/termine/buchen` verhindert.

**Konfidenz: 10**

**Wie geprüft?**  
Beide Routen prüfen vor der Buchung/Umbuchung einen bestehenden Termin mit gleichem Arzt, Terminart, Datum und Startzeit und lehnen mit Status `409` ab, falls eine Kollision vorliegt.

---

## 5. Frei: Nur leitende MFAs dürfen Online-Sperren aufheben

**Aussage:**  
In der App können nur MFAs mit der Berechtigungsstufe `"erweitert"` (leitende MFAs) eine Patientensperre aufheben – MFAs mit `"standard"` werden abgewiesen.

**Konfidenz: 10**

**Wie geprüft?**  
In `app/api/patientensperre/[id]/aufheben/route.ts` wird `mfa.berechtigungsstufe !== "erweitert"` geprüft und mit Status `403` ("Nur leitende MFAs können Sperren aufheben") abgelehnt.
