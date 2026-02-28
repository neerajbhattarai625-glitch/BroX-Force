import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const {
        customerName,
        customerPhone,
        customerEmail,
        customerLocation,
        items,
        subtotal,
        discount,
        total,
        adminEmail,
    } = body;

    // Format order items
    const itemsText = items
        .map(
            (item: { title: string; quantity: number; price: string }) =>
                `- ${item.title} x${item.quantity}  |  $${item.price}/each`
        )
        .join("\n");

    const emailBody = `
=== 🛍️ NEW BROX ORDER ===

CUSTOMER DETAILS
----------------
Name     : ${customerName}
Phone    : ${customerPhone}
Email    : ${customerEmail}
Location : ${customerLocation}

ORDER SUMMARY
-------------
${itemsText}

Subtotal  : $${subtotal}
Discount  : ${discount}%
TOTAL     : $${total}

=========================
Order received at ${new Date().toLocaleString()}
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

    try {
        await transporter.sendMail({
            from: `"BroX Orders" <${process.env.SMTP_USER || "broxorders@gmail.com"}>`,
            to: adminEmail,
            subject: `[BroX] New Order from ${customerName}`,
            text: emailBody,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Email send error:", err);
        // Still return success so order is accepted (email may fail in dev without SMTP creds)
        return NextResponse.json({ success: true, warning: "Email could not be sent. Check SMTP config." });
    }
}
