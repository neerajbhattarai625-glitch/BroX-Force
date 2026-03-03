import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Santitize body to only include fields that exist in Prisma schema
        const data: any = {};
        if (body.title !== undefined) data.title = body.title;
        if (body.price !== undefined) data.price = body.price.toString();
        if (body.discountPrice !== undefined) data.discountPrice = body.discountPrice?.toString() || null;
        if (body.description !== undefined) data.description = body.description;
        if (body.category !== undefined) data.category = body.category;
        if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
        if (body.sizes !== undefined) data.sizes = Array.isArray(body.sizes) ? body.sizes : [];
        if (body.colors !== undefined) data.colors = Array.isArray(body.colors) ? body.colors : [];
        if (body.stock !== undefined) data.stock = parseInt(body.stock) || 0;
        if (body.status !== undefined) data.status = body.status;
        if (body.isFeatured !== undefined) data.isFeatured = !!body.isFeatured;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: data
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error(`Failed to update product ${params}:`, error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Failed to delete product ${params}:`, error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
