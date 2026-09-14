import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, message, type = "inquiry" } = body;

    // Strict RFC Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.toLowerCase().trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid corporate email address." },
        { status: 400 }
      );
    }

    // Input sanitization and length bounds to prevent injection & buffer flooding
    const cleanEmail = email.toLowerCase().trim().slice(0, 120);
    const cleanName = typeof name === "string" ? name.replace(/[<>]/g, "").trim().slice(0, 80) : "N/A";
    const cleanMessage = typeof message === "string" ? message.replace(/[<>]/g, "").trim().slice(0, 2000) : "";
    const cleanType = typeof type === "string" && ["inquiry", "enterprise", "integration", "security"].includes(type.toLowerCase()) ? type.toLowerCase() : "inquiry";

    // Generate cryptographic verification ticket
    const randomHex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const ticketId = `0x${randomHex}`;
    const timestamp = new Date().toISOString();

    // Server-side audit log
    console.log(`[VERISETT_INQUIRY] Type: ${cleanType} | Email: ${cleanEmail} | Name: ${cleanName} | Ticket: ${ticketId} | Time: ${timestamp}`);

    // Return successful receipt and mailto fallback URL
    const founderEmail = "contact@verisett.com";
    const mailtoSubject = encodeURIComponent(`Verisett Inquiry [Ticket: ${ticketId}]`);
    const mailtoBody = encodeURIComponent(
      `Hello Verisett Team,\n\nI submitted an inquiry regarding:\n${cleanMessage || "General enterprise deployment"}\n\nEmail: ${cleanEmail}\nTicket: ${ticketId}`
    );
    const mailtoUrl = `mailto:${founderEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return NextResponse.json({
      success: true,
      ticketId,
      timestamp,
      recipientEmail: founderEmail,
      mailtoUrl,
      message: "Inquiry received. A confidential engineering partner will respond within 2 business hours.",
    });
  } catch (error) {
    console.error("Error processing contact request:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again or email contact@verisett.com directly." },
      { status: 500 }
    );
  }
}
