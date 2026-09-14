import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
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
          borderRadius: "8px",
          background: "linear-gradient(135deg, #1C1A17 0%, #0D0E12 100%)",
          border: "1.5px solid #D4AF37",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M20 14L26 18V24L20 27L14 24V18L20 14Z"
            fill="#C59B5F"
          />
          <circle cx="20" cy="20.5" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
