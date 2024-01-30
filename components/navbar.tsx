'use client';

import { Sparkles } from 'lucide-react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import MobileSidebar from '@/components/mobile-sidebar';
import { useProModal } from '@/hooks/use-pro-modal';
import Image from 'next/image';

const font = Poppins({
  weight: '600',
  subsets: ['latin']
});

interface NavBarPro {
  isPro: boolean;
}

const Navbar = ({ isPro }: NavBarPro) => {
  const ProModal = useProModal();

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      <div className="flex items-center">
        <MobileSidebar isPro={isPro} />
        <Link className="flex items-center gap-2" href="/">
          <Image src="/logo.svg" alt="intellibuddy logo" width={30} height={30} />
          <h1
            className={cn(
              'hidden md:block text-lg md:text-2xl font-medium text-primary',
              font.className
            )}
          >
            IntelliBuddy
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {!isPro && (
          <Button onClick={ProModal.onOpen} variant="premium" size="sm">
            Upgrade
            <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
          </Button>
        )}
        <ModeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
