import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();

        const updatedVoucher = await prisma.voucher.update({
            where: { id },
            data: body
        });

        return NextResponse.json(updatedVoucher);
    } catch (error) {
        console.error(`Failed to update voucher ${id}:`, error);
        return NextResponse.json({ error: "Failed to update voucher" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.voucher.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Failed to delete voucher ${id}:`, error);
        return NextResponse.json({ error: "Failed to delete voucher" }, { status: 500 });
    }
}
