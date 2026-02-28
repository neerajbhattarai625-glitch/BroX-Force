import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const emailBody = `
=== 📨 NEW CONTACT INQUIRY ===

SENDER DETAILS
--------------
Name  : ${name}
Email : ${email}

SUBJECT
-------
${subject || "No Subject Provided"}

MESSAGE
-------
${message}

=========================
Received at ${new Date().toLocaleString()}
`;

        // We use Gmail with App Password (or another SMTP transport)
        // In production, store credentials in Vercel environment variables.
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER || "broxorders@gmail.com",
                pass: process.env.SMTP_PASS || "",
            },
        });

        await transporter.sendMail({
            from: `"BroX Contact" <${process.env.SMTP_USER || "broxorders@gmail.com"}>`,
            to: process.env.SMTP_USER || "broxorders@gmail.com", // Send to self/admin
            replyTo: email,
            subject: `[BroX Contact] ${subject || "New Inquiry"} from ${name}`,
            text: emailBody,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact Email send error:", err);
        return NextResponse.json({ success: false, error: "Email could not be sent. Check SMTP config." }, { status: 500 });
    }
}
