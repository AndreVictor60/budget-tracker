import { redirect } from 'next/navigation';
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    let userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id,
        },
    });

    if(!userSettings) {
        userSettings = await prisma.userSettings.create({
            data: {
                userId: user.id,
                currency: "EUR", // Default currency
            },
        });
    }

    revalidatePath("/");
    return Response.json({userSettings});
}