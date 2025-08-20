"use client"
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GetFormatterForCurrency } from '@/lib/helpers';
import { Timeframe } from '@/lib/types';
import { UserSettings } from '@prisma/client'
import React, { useCallback, useMemo } from 'react'
import HistoryPeriodSelector from './HistoryPeriodSelector';
import { useQuery } from '@tanstack/react-query';
import SkeletonWrapper from '@/app/components/SkeletonWrapper';
import {Bar,BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';


function History({ userSettings }: { userSettings: UserSettings }) {
    const [timeframe, setTimeframe] = React.useState<Timeframe>('month');
    const [period, setPeriod] = React.useState<{ year: number; month: number }>({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
    });

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency]);

    const historyDataQuery = useQuery({
        queryKey: ["overview","history", timeframe, period],
        queryFn: () => fetch(`/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`).then(res => res.json()),
    });

    const dataAvailable = historyDataQuery.data && historyDataQuery.data.length > 0;

  return (
    <div className='px-10'>
        <h2 className='mt-12 text-3xl font-bold'>Historique</h2>
        <Card className='col-span-12 mt-2 w-full'>
            <CardHeader className='gap-2'>
                <CardTitle className='grid grid-flow-row justify-between gap-2 md:grid-flow-col'>
                    <HistoryPeriodSelector
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                        period={period}
                        setPeriod={setPeriod}
                    />
                    <div className="flex gap-2">
                        <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm font-bold">
                        <div className="h-4 w-4 rounded-full bg-emerald-500" />
                        Revenu
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm font-bold">
                        <div className="h-4 w-4 rounded-full bg-red-500" />
                        Dépense
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <SkeletonWrapper isLoading={historyDataQuery.isLoading}>
                    {dataAvailable && 
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart height={300} data={historyDataQuery.data} barCategoryGap={5} >
                            <defs>
                                <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={0} stopColor="#10B981" stopOpacity={1} />
                                    <stop offset={1} stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={0} stopColor="#EF4444" stopOpacity={1} />
                                    <stop offset={1} stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="5 5" strokeOpacity={"0.2"} vertical={false} />
                            <XAxis
                                stroke='#888888'
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                padding={{ left: 5, right: 5 }}
                                dataKey={(data) => {
                                    const {year, month, day} = data;
                                    const date = new Date(year, month, day || 1);
                                    if(timeframe === "year") {
                                        return date.toLocaleDateString('default', { month: 'long' });
                                    }
                                    return date.toLocaleDateString('default', { day: '2-digit'});
                                }}
                             />
                            <YAxis 
                                stroke='#888888'
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                             />
                             <Bar dataKey={"income"} label="Income" fill="url(#incomeBar)" radius={4} className='cursor-pointer' />
                             <Bar dataKey={"expense"} label="Expense" fill="url(#expenseBar)" radius={4} className='cursor-pointer' />
                            <Tooltip
                                cursor={{ opacity: 0.1 }}
                                content={props => <CustomTooltip {...props} formatter={formatter} />}
                            />  
                        </BarChart>
                    </ResponsiveContainer>}
                    {!dataAvailable && 
                    <Card className='flex h-[300px] flex-col items-center justify-center bg-background'>
                        Aucune donnée disponible pour cette période.
                        <p className='text-sm text-muted-foreground'>
                            Veuillez sélectionner une autre période ou ajouter de nouvelles transactions.
                        </p>
                    </Card>}
                </SkeletonWrapper>
            </CardContent>
        </Card>
    </div>
  )
}

export default History

function CustomTooltip({ active, payload, formatter }: any) {
    if(!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    const {expense,income} = data;
    return (
        <div className='min-w-[300px] rounded border bg-background p-4'>
            <TooltipRow formatter={formatter} label="Dépense" value={expense} bgColor="bg-red-500" textColor="text-red-500" />
            <TooltipRow formatter={formatter} label="Revenu" value={income} bgColor="bg-emerald-500" textColor="text-emerald-500" />
            <TooltipRow formatter={formatter} label="Balance" value={income - expense} bgColor="bg-gray-100" textColor="text-foreground" />
        </div>
    )
}

function TooltipRow({ label, value, formatter, bgColor, textColor }:
     { label: string; value: number; formatter: Intl.NumberFormat; bgColor: string; textColor: string }) {

    const formattingFn = useCallback((value: number) => {
        return formatter.format(value);
    }, [formatter]);
    return (
        <div className={`flex items-center gap-2`}>
            <div className={`h-4 w-4 rounded-full ${bgColor}`}/>
            <div className="flex w-full justify-between">
                <p className='text-sm text-muted-foreground'>{label}</p>
                <div className={cn("text-sm font-bold", textColor)}>
                    <CountUp 
                    duration={0.5}
                    preserveValue
                    end={value}
                    decimals={0}
                    formattingFn={formattingFn}
                    className='text-sm'
                    />
                </div>
            </div>
        </div>
    );
}