import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Destructure items and the rest of the order details
        const { items, ...orderData } = body;

        const newOrder = await prisma.order.create({
            data: {
                ...orderData,
                items: {
                    create: items.map((item: any) => ({
                        title: item.title,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                        color: item.color,
                        customSize: item.customSize
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
