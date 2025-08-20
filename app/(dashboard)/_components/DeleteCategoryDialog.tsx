"use client"

import { Category } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { ReactNode } from 'react'
import { DeleteCategory } from '../_actions/categories'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { TransactionType } from '@/lib/types'

interface Props {
    trigger: ReactNode,
    category: Category
}

function DeleteCategoryDialog({ trigger, category }: Props) {
    const categoryIdentifier =`${category.name}-${category.type}`
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: DeleteCategory,
        onSuccess: async () => {
            toast.success('Catégorie supprimée avec succès', {
                id: categoryIdentifier,
            });

            await queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
        onError: (error: Error) => {
            toast.error(`Erreur lors de la suppression de la catégorie: ${error.message}`, {
                id: categoryIdentifier,
            });
        },
    });
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la catégorie <span className='font-semibold'>{category.name}</span> ? Cette action est irréversible.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                toast.loading('Suppression de la catégorie...', { id: categoryIdentifier });
                deleteMutation.mutate({
                    name: category.name,
                    type: category.type as TransactionType,
                    icon: category.icon,
                });
            }}
            >
            Continue</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategoryDialog