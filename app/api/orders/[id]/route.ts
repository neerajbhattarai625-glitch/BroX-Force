import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();

        const updatedOrder = await prisma.order.update({
            where: { id: params.id },
            data: body,
            include: { items: true }
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Failed to update order:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.order.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete order:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
