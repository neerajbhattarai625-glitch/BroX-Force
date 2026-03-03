import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure required fields are present and correctly typed
        const {
            title,
            price,
            discountPrice,
            description,
            category,
            imageUrl,
            sizes,
            colors,
            stock,
            status,
            isFeatured
        } = body;

        if (!title || !price || !description || !category || !imageUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProduct = await prisma.product.create({
            data: {
                title,
                price: price.toString(),
                discountPrice: discountPrice?.toString() || null,
                description,
                category,
                imageUrl,
                sizes: Array.isArray(sizes) ? sizes : [],
                colors: Array.isArray(colors) ? colors : [],
                stock: parseInt(stock) || 0,
                status: status || "In Stock",
                isFeatured: !!isFeatured
            }
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
