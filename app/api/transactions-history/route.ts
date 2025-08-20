import { UserSettings } from '@prisma/client';
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from '@/lib/prisma';
import { GetFormatterForCurrency } from '@/lib/helpers';

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const queryParams = OverviewQuerySchema.safeParse({
        from,
        to,
    });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400
        });
    }

    const transactions = await getTransactionHistory({
        userId: user.id,
        from: queryParams.data.from,
        to: queryParams.data.to,
    });

    return Response.json(transactions);
}

export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionHistory>>;

async function getTransactionHistory({ userId, from, to }: { userId: string; from: Date; to: Date }) {
    const UserSettings = await prisma.userSettings.findUnique({
        where: {
            userId: userId,
        },
    });
    if (!UserSettings) {
        return Response.json('User settings not found');
    }
    const formatter = GetFormatterForCurrency(UserSettings.currency);
    const transactions = await prisma.transaction.findMany({
        where: {
            userId: userId,
            date: {
                gte: from,
                lte: to,
            },
        },
        orderBy: {
            date: 'desc',
        },
    });
    return transactions.map(transaction => ({
        ...transaction,
        formattedAmount: formatter.format(transaction.amount),
        date: transaction.date.toISOString(),
    }));
}
