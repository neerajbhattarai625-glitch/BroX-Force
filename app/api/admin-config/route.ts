import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let config = await prisma.adminConfig.findUnique({
            where: { id: 1 }
        });

        if (!config) {
            config = await prisma.adminConfig.create({
                data: {
                    id: 1,
                    email: "codevengers8848@gmail.com",
                    passwordHash: "brox@admin2024",
                    esewa: true,
                    khalti: true,
                    stripe: false,
                    cod: true,
                    paypal: true,
                    shippingCost: 5,
                    freeShippingThreshold: 100,
                    exchangeRate: 135,
                }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to fetch admin config:", error);
        return NextResponse.json({ error: "Failed to fetch admin config" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        // Remove nested 'payments' if it exists to flatten for Prisma
        const { payments, ...rest } = body;
        const data = { ...rest, ...payments };

        const updatedConfig = await prisma.adminConfig.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data }
        });
        return NextResponse.json(updatedConfig);
    } catch (error) {
        console.error("Failed to update admin config:", error);
        return NextResponse.json({ error: "Failed to update admin config" }, { status: 500 });
    }
}
