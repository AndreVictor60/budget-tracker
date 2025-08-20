"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Currencies, Currency } from "@/lib/currencies"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { UserSettings } from "@prisma/client"
import { UpdateUserCurrency } from "../wizard/_actions/userSettings"
import { toast } from "sonner"


export function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  )

  const userSettings = useQuery<{userSettings: UserSettings}>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
});

React.useEffect(() => {
  const settings = userSettings.data?.userSettings;
  if (!settings) return;
  const userCurrency = Currencies.find(
    (currency) => currency.value === settings.currency
  );
  if (userCurrency) {
    setSelectedOption(userCurrency);
  }
}, [userSettings.data]);

const mutation = useMutation({
  mutationFn: UpdateUserCurrency,
  onSuccess: (data: UserSettings) => {  
    toast.success("Devise mise à jour avec succès",{
      id: "update-currency",
    });
    setSelectedOption(
      Currencies.find((currency) => currency.value === data.currency) || null
    );
  },
  onError: (error: Error) => {
    toast.error(`Erreur lors de la mise à jour de la devise: ${error.message}`, {
      id: "update-currency",
    });
  },
})

const selectOption = React.useCallback((value: Currency | null) => {
  if(!value) {
    toast.error("Veuillez sélectionner une devise valide");
    return;
  };
  toast.loading("Mise à jour de la devise...", {
    id: "update-currency",
  });

  mutation.mutate(value.value)
},
[mutation]);

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isLoading} >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
              {selectedOption ? <>{selectedOption.label}</> : <>+ Ajouter une devise</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isLoading} >
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={mutation.isPending}>
          {selectedOption ? <>{selectedOption.label}</> : <>+ Ajouter une devise</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
        </div>
      </DrawerContent>
    </Drawer>
    </SkeletonWrapper>
  )
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (status: Currency | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter devise..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency: Currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((priority) => priority.value === value) || null
                )
                setOpen(false)
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
