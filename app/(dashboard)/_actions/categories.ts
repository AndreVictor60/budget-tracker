"use server"
import { redirect } from 'next/navigation';
import { CreateCategorySchema, CreateCategorySchemaType, DeleteCategorySchema, DeleteCategorySchemaType } from '@/schema/categories';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';


export async function CreateCategory(Form: CreateCategorySchemaType) {
    const parsedBody = CreateCategorySchema.safeParse(Form);
    if (!parsedBody.success) {
        throw new Error('Invalid form data');
    }

    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }
    const { name, icon, type } = parsedBody.data;

    return await prisma.category.create({
        data: {
            userId: user.id,
            name,
            icon,
            type,
        },
    });
}

export async function DeleteCategory(from: DeleteCategorySchemaType) {
    const parsedBody = DeleteCategorySchema.safeParse(from);
    if (!parsedBody.success) {
        throw new Error('Invalid form data');
    }

    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
    }

    const categories = await prisma.category.delete({
        where: {
            name_userId_type: {
                userId: user.id,
                name: parsedBody.data.name,
                type: parsedBody.data.type,
            },
        },  
    });

}