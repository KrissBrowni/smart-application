"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    setIsLoggedIn(!!code);
  }, [pathname]);

  function logout() {
    sessionStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
  }

  const links = [
    { href: "/", label: "Start" },
    { href: "/terminbuchung", label: "Termin buchen" },
    { href: "/meine-termine", label: "Meine Termine" },
    { href: "/rezept-anfragen", label: "Rezept anfragen" },
    { href: "/benachrichtigungen", label: "Benachrichtigungen" },
    { href: "/opt-in", label: "Einstellungen" },
    { href: "/warteliste", label: "Warteliste" },
    { href: "/dashboard", label: "Dashboard (MFA)" },
  ];

  return (
    <nav style={{
      background: "var(--primary)", padding: "0.75rem 2rem",
      display: "flex", alignItems: "center", gap: "1.5rem",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{
        color: "white", textDecoration: "none", fontWeight: 700, fontSize: "1.1rem",
        whiteSpace: "nowrap",
      }}>
        Praxis Demir & Kollegen
      </Link>

      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", color: "white", fontSize: "1.5rem",
          cursor: "pointer", display: "none", marginLeft: "auto",
        }}
        className="nav-toggle"
      >
        {open ? "✕" : "☰"}
      </button>

      <div style={{
        display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center",
      }} className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? "var(--primary-dark)" : "white",
              textDecoration: "none", fontSize: "0.9rem",
              padding: "0.25rem 0.5rem", borderRadius: "4px",
              background: pathname === link.href ? "rgba(255,255,255,0.9)" : "transparent",
              fontWeight: pathname === link.href ? 600 : 400,
            }}
          >
            {link.label}
          </Link>
        ))}

        {isLoggedIn && (
          <button onClick={logout} style={{
            padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.2)", color: "white",
            border: "1px solid white", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem",
            fontWeight: 500,
          }}>
            Logout
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-toggle { display: block !important; }
          .nav-links {
            display: ${open ? "flex" : "none"} !important;
            flex-direction: column !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: var(--primary) !important;
            padding: 1rem !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </nav>
  );
}
