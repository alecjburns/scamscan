import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ScamScan — check a recruiter or job offer before you reply";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#FBFAF7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#0E7C66" />
            <path
              d="M16 6l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V9l8-3z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M11 15.5h10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: "72px", fontWeight: 600, color: "#1A1A1A" }}>
            Scam<span style={{ color: "#0E7C66" }}>Scan</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "40px", fontSize: "40px", color: "#1A1A1A" }}>
          Check a recruiter or job offer before you reply.
        </div>
        <div style={{ display: "flex", marginTop: "24px", fontSize: "28px", color: "#6B6B6B" }}>
          Paste the message. Get an evidence-backed verdict. Nothing is stored.
        </div>
      </div>
    ),
    size
  );
}
