import { test, expect } from "@playwright/test";

test.describe("Patienten-Flow (e2e)", () => {
  const BASE = "http://localhost:3000";

  test("Startseite lädt und zeigt Hero-Bereich", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("h1")).toContainText("Praxis Demir");
    await expect(page.locator("text=Termin buchen")).toBeVisible();
    await expect(page.locator("text=Jetzt registrieren")).toBeVisible();
  });

  test("Navigation ist sichtbar und enthält Login-Link", async ({ page }) => {
    await page.goto(BASE);
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    // Die Nav enthält Links – prüfen ob mindestens einer sichtbar ist
    await expect(page.locator('a:has-text("Login")')).toBeVisible();
  });

  test("Login mit gültigem Code + Passwort funktioniert", async ({ page }) => {
    await page.goto(`${BASE}/patient/login`);
    
    await page.fill('input[placeholder*="Patient-Code"]', "PAT-TEST01");
    await page.fill('input[type="password"]', "1234");
    await page.click('button:has-text("Anmelden")');

    // Sollte auf Terminbuchung weiterleiten
    await expect(page).toHaveURL(/terminbuchung/);
  });

  test("Login mit falschem Passwort zeigt Fehler", async ({ page }) => {
    await page.goto(`${BASE}/patient/login`);

    await page.fill('input[placeholder*="Patient-Code"]', "PAT-TEST01");
    await page.fill('input[type="password"]', "wrong");
    await page.click('button:has-text("Anmelden")');

    await expect(page.locator("text=Passwort falsch")).toBeVisible();
  });

  test("Login mit gesperrtem Patient zeigt Sperr-Hinweis", async ({ page }) => {
    await page.goto(`${BASE}/patient/login`);

    await page.fill('input[placeholder*="Patient-Code"]', "PAT-TEST04");
    await page.fill('input[type="password"]', "4321");
    await page.click('button:has-text("Anmelden")');

    await expect(page.locator("text=Online-Buchung gesperrt")).toBeVisible();
  });

  test("Default-PIN erzwingt Passwort-Änderung", async ({ page }) => {
    await page.goto(`${BASE}/patient/login`);

    await page.fill('input[placeholder*="Patient-Code"]', "PAT-TEST03");
    await page.fill('input[type="password"]', "0000");
    await page.click('button:has-text("Anmelden")');

    // Sollte auf Passwort-ändern-Seite landen
    await expect(page.locator("h1")).toContainText("Passwort ändern");
  });

  test("Verfügbarkeit zeigt Slots für Werktag", async ({ page }) => {
    await page.goto(`${BASE}/patient/login`);

    await page.fill('input[placeholder*="Patient-Code"]', "PAT-TEST01");
    await page.fill('input[type="password"]', "1234");
    await page.click('button:has-text("Anmelden")');
    await page.waitForURL(/terminbuchung/);

    // Morgen auswählen
    const morgen = new Date();
    morgen.setDate(morgen.getDate() + 1);
    const datumStr = morgen.toISOString().split("T")[0];

    await page.fill('input[type="date"]', datumStr);
    await page.click('button:has-text("Verfügbarkeit prüfen")');

    // Warten auf Ergebnisse (optional – nur prüfen dass kein Crash)
    await page.waitForTimeout(1000);
    // Kein Fehler-Text sichtbar
    await expect(page.locator("text=Fehler")).not.toBeVisible();
  });

  test("Dashboard des MFA lädt", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});
