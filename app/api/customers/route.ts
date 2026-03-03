import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const customer = await prisma.customer.upsert({
            where: { email: body.email },
            update: {
                name: body.name,
                phone: body.phone,
                address: body.address,
                totalSpent: { increment: parseFloat(body.totalSpent) || 0 }
            },
            create: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
                totalSpent: parseFloat(body.totalSpent) || 0
            }
        });
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Failed to sync customer:", error);
        return NextResponse.json({ error: "Failed to sync customer" }, { status: 500 });
    }
}
