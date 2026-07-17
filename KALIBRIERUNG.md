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
In `app/api/termine/verfuegbarkeit/route.ts` wird `isWeekend` geprüft, eine Praxisschließungs-Abfrage gemacht, und für jeden Arzt werden nur Slots innerhalb seiner `sprechzeiten` generiert. Abwesende Ärzte werden übersprungen.

---

## 3. Datenmodell (n:m): Patient und Ärzt:in über Termine

**Aussage:**  
Patienten und Ärzt:innen sind über eine n:m-Beziehung verknüpft, vermittelt durch die Entität `Termin`, die beide Seiten referenziert.

**Konfidenz: 10**

**Wie geprüft?**  
`Patient` hat `Termin[]`, `Termin` hat `patientId` und `arztId`. Ein Patient kann mehrere Ärzt:innen haben, eine Ärztin mehrere Patienten — die n:m-Relation wird durch `Termin` aufgelöst.

---

## 4. Widerspruchsauflösung: Doppelbuchung verhindern (echte Zeitbereichs-Kollisionsprüfung)

**Aussage:**  
Widersprüchliche Doppelbuchungen werden durch eine echte Zeitbereichs-Überlappungsprüfung in `POST /api/termine/buchen` und `PATCH /api/termine/[id]/umbuchen` verhindert – unabhängig von der Terminart.

**Konfidenz: 10**

**Wie geprüft?**  
Beide Routen laden alle bestehenden Buchungen für denselben Arzt und Tag und prüfen, ob sich die Zeitfenster überlappen:  
`neuerStart < bestehendesEnde && neuesEnde > bestehenderStart`  
Wird eine Überlappung gefunden, lehnen beide mit Status `409` ab.

---

## 5. Frei: Nur leitende MFAs dürfen Online-Sperren aufheben

**Aussage:**  
In der App können nur MFAs mit der Berechtigungsstufe `"erweitert"` eine Patientensperre aufheben – MFAs mit `"standard"` werden abgewiesen.

**Konfidenz: 10**

**Wie geprüft?**  
In `app/api/patientensperre/[id]/aufheben/route.ts` wird `mfa.berechtigungsstufe !== "erweitert"` geprüft und mit Status `403` ("Nur leitende MFAs können Sperren aufheben") abgelehnt.
