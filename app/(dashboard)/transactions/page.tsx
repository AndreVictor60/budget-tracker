"use client"

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { differenceInDays, startOfMonth } from 'date-fns';
import React from 'react'
import { toast } from 'sonner';
import TransactionTable from './_components/TransactionTable';

function TansactionPage() {
    const [dateRange, setDateRange] = React.useState<{from: Date, to: Date}>({
        from: startOfMonth(new Date()), // Start of the current month
        to: new Date(),
    });
  return (
    <>
    <div className='border-b bg-card'>
        <div className='px-10 flex flex-wrap items-center justify-between gap-6 py-8'>
            <div>
                <p className='text-3xl font-bold'>Historique des transactions</p>
            </div>
                    <DateRangePicker
                initialDateFrom={dateRange.from}
                initialDateTo={dateRange.to}
                showCompare={false}
                onUpdate={(values) => {
                    const {from,to} = values.range;
                    if(!from || !to) return;
                    if(differenceInDays(to,from) > MAX_DATE_RANGE_DAYS){
                        toast.error(`La plage de dates sélectionnée est trop grande. La plage maximale autorisée est de ${MAX_DATE_RANGE_DAYS} jours.`)
                         return;
                    };
                   setDateRange({from,to});
                }}
                 />
        </div>
    </div>
    <div className='px-10'>
        <TransactionTable from={dateRange.from} to={dateRange.to} />
    </div>
    </>
  )
}

export default TansactionPage