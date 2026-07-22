export default function LoadingSpinner({ text = "Lade..." }: { text?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "3rem 1rem", gap: "1rem",
    }}>
      <div className="spinner" />
      <p style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>{text}</p>
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--gray-meta);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
