"use client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Delete } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { DeleteTransaction } from '../_actions/deleteTransaction';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    transactionId: string;
}
function DeleteTransactionDialog({ open, setOpen, transactionId }: Props) {
 const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            toast.success('Transaction supprimée avec succès', {
                id: transactionId,
            });

            await queryClient.invalidateQueries({
                queryKey: ['transactions'],
            });
        },
        onError: (error: Error) => {
            toast.error(`Erreur lors de la suppression de la transaction: ${error.message}`, {
                id: transactionId,
            });
        },
    });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                toast.loading('Suppression de la transaction...', { id: transactionId });
                deleteMutation.mutate({
                    id: transactionId,
                });

            }}
            >
            Continue</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteTransactionDialog