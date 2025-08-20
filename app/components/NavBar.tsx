"use client";
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { ThemeSwitcherBtn } from './ThemeSwitcherBtn';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Logo, { LogoMobile } from './Logo';
import { UserButton } from '@clerk/nextjs';

function NavBar() {
  return (
    <>
        <DesktopNavBar />
        <MobileNavBar />
    </>
  )
}

const items = [
    { label: 'Home', href: '/' },
    { label: 'Transactions', href: '/transactions' },
    { label: 'Manage', href: '/manage' },
];

function MobileNavBar() {
    const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className='block border-separate bg-background md:hidden'>
        <nav className="container flex items-center justify-between px-8">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant='ghost' size='icon'>
                        <Menu />
                        </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[400px] sm:w-[540px]'>
                    <Logo />
                    <div className="flex flex-col gap-1 pt-4">
                        {items.map((item) => (
                            <NavbarItem
                             key={item.label}
                            link={item.href}
                            label={item.label}
                            clickCallback={() => setIsOpen((prev) => !prev)} />
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
                <LogoMobile /> 
            </div>
            <div className="flex items-center gap-2">
                <ThemeSwitcherBtn />
                <UserButton afterSwitchSessionUrl='/sign-in' />
            </div>
        </nav>
    </div>
    )
}

function DesktopNavBar() {
  return (
    <div className='hidden border-separate border-b bg-background md:block'>
        <nav className='px-10 flex items-center justify-between'>
            <div className='flex h-[80px] min-h-[60px] items-center gap-x-4'>
                <Logo />
                <div className="flex h-full">
                    {items.map((item) => (
                        <NavbarItem key={item.label} link={item.href} label={item.label} />
                    ))}
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <ThemeSwitcherBtn />
                <UserButton afterSwitchSessionUrl='/sign-in' />
            </div>
        </nav>
    </div>
  )
}

function NavbarItem({ link, label, clickCallback }: {
     link: string; 
     label: string;
     clickCallback?: () => void;
     }) {
        const pathname = usePathname();
        const isActive = pathname === link;

        return (
            <div className="relative flex items-center">
                <Link href={link} className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
                    isActive && 'text-foreground' 
                )}
                onClick={() => {
                    if (clickCallback) clickCallback();
                }}
                >{label}</Link>
                {isActive && (<div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block" />)}
            </div>
        )
     }
export default NavBar