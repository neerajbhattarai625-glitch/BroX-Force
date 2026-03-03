import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let stats = await prisma.analytics.findUnique({
            where: { id: 1 }
        });

        if (!stats) {
            stats = await prisma.analytics.create({
                data: {
                    id: 1,
                    uniqueVisitors: 0,
                    totalPageHits: 0,
                    revenueNPR: 0,
                    revenueUSD: 0,
                    profitNPR: 0,
                    profitUSD: 0
                }
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to fetch analytics:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type } = body; // 'hit' or 'visitor' or 'revenue'

        let updateData: any = {};
        if (type === 'hit') {
            updateData = { totalPageHits: { increment: 1 } };
        } else if (type === 'visitor') {
            updateData = { uniqueVisitors: { increment: 1 }, totalPageHits: { increment: 1 } };
        } else if (type === 'revenue') {
            const { npr, usd, pNpr, pUsd } = body;
            updateData = {
                revenueNPR: { increment: parseFloat(npr) || 0 },
                revenueUSD: { increment: parseFloat(usd) || 0 },
                profitNPR: { increment: parseFloat(pNpr) || 0 },
                profitUSD: { increment: parseFloat(pUsd) || 0 }
            };
        }

        const stats = await prisma.analytics.upsert({
            where: { id: 1 },
            update: updateData,
            create: {
                id: 1,
                uniqueVisitors: type === 'visitor' ? 1 : 0,
                totalPageHits: 1,
                revenueNPR: type === 'revenue' ? (parseFloat(body.npr) || 0) : 0,
                revenueUSD: type === 'revenue' ? (parseFloat(body.usd) || 0) : 0,
                profitNPR: type === 'revenue' ? (parseFloat(body.pNpr) || 0) : 0,
                profitUSD: type === 'revenue' ? (parseFloat(body.pUsd) || 0) : 0
            }
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to update analytics:", error);
        return NextResponse.json({ error: "Failed to update analytics" }, { status: 500 });
    }
}
