import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./navigation";

export const metadata: Metadata = {
  title: "Praxis Demir & Kollegen",
  description: "Terminbuchungs- und Verwaltungssoftware",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
