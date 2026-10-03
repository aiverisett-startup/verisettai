import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          borderRadius: "16px",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 25 L50 78 L80 25 M32 40 L68 40 M20 25 L40 50 L50 78 L60 50 L80 25 M35 25 L50 55 L65 25 M40 50 L60 50"
            stroke="#3B82F6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="25" r="7" fill="#06B6D4" />
          <circle cx="80" cy="25" r="7" fill="#06B6D4" />
          <circle cx="50" cy="78" r="8" fill="#2563EB" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
