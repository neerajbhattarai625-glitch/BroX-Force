import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let theme = await prisma.theme.findUnique({
            where: { id: 1 }
        });

        if (!theme) {
            theme = await prisma.theme.create({
                data: {
                    id: 1,
                    hero: "https://images.unsplash.com/photo-1620806497334-927918a096c4?auto=format&fit=crop&q=80&w=2000",
                    body: "",
                    footer: "",
                }
            });
        }

        return NextResponse.json(theme);
    } catch (error) {
        console.error("Failed to fetch theme:", error);
        return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const updatedTheme = await prisma.theme.upsert({
            where: { id: 1 },
            update: body,
            create: { id: 1, ...body }
        });
        return NextResponse.json(updatedTheme);
    } catch (error) {
        console.error("Failed to update theme:", error);
        return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
    }
}
