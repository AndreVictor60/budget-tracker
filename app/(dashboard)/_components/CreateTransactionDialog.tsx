"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ReactNode, useCallback } from "react";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

import React from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transaction";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";

function CreateTransactionDialog({ trigger, type }: Props) {
const form = useForm<CreateTransactionSchemaType>({
  resolver: zodResolver(CreateTransactionSchema) as Resolver<CreateTransactionSchemaType>,
  defaultValues: {
    type,
    date: new Date(),
  },
});

  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const handleCategoryChange = useCallback((value: string) => {
    form.setValue("category", value);
  }, [form]);

  const {mutate, isPending} = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success(`Transaction created successfully!`, {
        id: "create-transaction",
      });

      form.reset({
        type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined
      });

      queryClient.invalidateQueries({
        queryKey: ['overview'],
      });

      setOpen((prev) => !prev);
    }
  });

  const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
    toast.loading("Creating transaction...", {
      id: "create-transaction",
    });
    mutate({
      ...values, 
      date: DateToUTCDate(values.date),
    });
  }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Créer une nouvelle transaction de
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type === "income" ? "Revenu" : "Dépense"}
            </span>
            
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input defaultValue={""} {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optionel)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction montant (required)
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <CategoryPicker type={type} onChange={handleCategoryChange} />
                    </FormControl>
                    <FormDescription>
                      Selectionner la catégorie de la transaction
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-[195px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")} >
                            {field.value instanceof Date ? (format(field.value, "dd/MM/yyyy")) : (<span>Sélectionner une date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value as Date | undefined} onSelect={
                          (value) => {
                            if(!value) return;
                            field.onChange(value);
                          }
                        }  />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Sélectionnez une date pour cela.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
         <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant={"secondary"}
                      onClick={() => {
                        form.reset();
                      }}
                    >
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                    {!isPending && "Créer"}
                    {isPending && <Loader2 className="animate-spin" />}
                  </Button>
                </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
