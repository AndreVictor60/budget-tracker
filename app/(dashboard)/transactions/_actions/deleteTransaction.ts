"use server"

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

export async function DeleteTransaction({ id }: { id: string }) {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }
    const transaction = await prisma.transaction.findUnique({
        where: {
            id,
            userId: user.id,
        },
    });
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    await prisma.$transaction([
        prisma.transaction.delete({
            where: {
                id,
                userId: user.id,
            },
        }),
        prisma.monthHistory.updateMany({
            where: {
                userId: user.id,
                day: transaction.date.getUTCDate(),
                month: transaction.date.getUTCMonth(),
                year: transaction.date.getUTCFullYear(),
            },
            data: {
                ...(transaction.type === 'EXPENSE' && {
                    expense: {
                        decrement: transaction.amount,
                    }
                }),
                ...(transaction.type === 'INCOME' && {
                    income: {
                        decrement: transaction.amount,
                    }
                }),
            },
        }),
        prisma.yearHistory.update({
            where: {
                month_year_userId: {
                    month: transaction.date.getUTCMonth(),
                    year: transaction.date.getUTCFullYear(),
                    userId: user.id,
                },
            },
            
            data: {
                ...(transaction.type === 'EXPENSE' && {
                    expense: {
                        decrement: transaction.amount,
                    }
                }),
                ...(transaction.type === 'INCOME' && {
                    income: {
                        decrement: transaction.amount,
                    }
                }),
            },
        }),
    ])
}