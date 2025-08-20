"use client";
import { CurrencyComboBox } from "@/app/components/CurrencyComboBox";
import SkeletonWrapper from "@/app/components/SkeletonWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionType } from "@/lib/types";
import { Category, Transaction } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  Delete,
  PlusSquare,
  TrashIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React from "react";
import CreateCategoryDialog from "../_components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import DeleteCategoryDialog from "../_components/DeleteCategoryDialog";

function page() {
  return (
    <>
      <div className="border-b bg-card">
        <div className="px-10 flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Paramètres</p>
            <p className="text-muted-foreground">
              Gérez les paramètres de votre compte et vos catégories
            </p>
          </div>
        </div>
      </div>
      <div className="px-10 flex flex-col gap-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Devise</CardTitle>
            <CardDescription>
              Définissez votre devise par défaut pour les transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
}

export default page;

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0;
  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "expense" ? (
                <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
              ) : (
                <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
              )}
            </div>
            <div>
              <span className="text-lg font-semibold capitalize">
                {type === "income" ? "Revenus" : "Dépenses"}
              </span>
            </div>

            <CreateCategoryDialog
              type={type}
              succesCallback={() => categoriesQuery.refetch()}
              trigger={
                <Button variant={"secondary"} className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Ajouter une catégorie
                </Button>
              }
            />
          </CardTitle>
          <CardDescription>
            Gérez vos catégories de {type === "income" ? "revenus" : "dépenses"}
            .
          </CardDescription>
        </CardHeader>
        <Separator />
        {!dataAvailable && (
          <div className="flex flex-col h-40 w-full items-center justify-center">
            <p>
              No
              <span
                className={cn(
                  "m-1",
                  type === "income" ? "text-emerald-500" : "text-red-500"
                )}
              >
                {type}
              </span>
              categories found.
            </p>
            <p className="text-sm text-muted-foreground">
              Add a new category to get started.
            </p>
          </div>
        )}
        {dataAvailable && (
          <div className="grid grid-flow-raw gap-2 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesQuery.data.map((category: Category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1]  dark:shadow-black/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl">{category.icon}</span>
        <span className="text-lg font-semibold capitalize">
          {category.name}
        </span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            variant="ghost"
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground !hover:bg-red-500/20"
          >
            <TrashIcon className="h-4 w-4" />
            Supprimer
          </Button>
        }
      />
    </div>
  );
}
