'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-xl font-bold">Art Captcha CMS</h1>
          </Link>
          {session && (
            <nav className="hidden md:flex items-center space-x-4 ml-8">
              <Link
                href="/"
                className={`text-sm font-medium hover:text-foreground transition-colors ${
                  pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                Dashboard
              </Link>
              <Link
                href="/new"
                className={`text-sm font-medium hover:text-foreground transition-colors ${
                  pathname === '/new'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                Create
              </Link>
              <Link
                href="/widget-generator"
                className={`text-sm font-medium hover:text-foreground transition-colors ${
                  pathname === '/widget-generator'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                Widget Generator
              </Link>
              <Link
                href="/docs"
                className={`text-sm font-medium hover:text-foreground transition-colors ${
                  pathname === '/docs'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                Docs
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="User menu"
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || ''}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
