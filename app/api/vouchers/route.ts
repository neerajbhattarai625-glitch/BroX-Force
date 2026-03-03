import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(vouchers);
    } catch (error) {
        console.error("Failed to fetch vouchers:", error);
        return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, discountPercentage, expiryDate, usageLimit } = body;

        if (!code || !discountPercentage) {
            return NextResponse.json({ error: "Code and discountPercentage are required" }, { status: 400 });
        }

        const newVoucher = await prisma.voucher.create({
            data: {
                code: code.toUpperCase(),
                discountPercentage: parseInt(discountPercentage),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                isActive: true,
                isUsed: false,
                usageCount: 0
            }
        });

        return NextResponse.json(newVoucher, { status: 201 });
    } catch (error) {
        console.error("Failed to create voucher:", error);
        return NextResponse.json({ error: "Failed to create voucher" }, { status: 500 });
    }
}
