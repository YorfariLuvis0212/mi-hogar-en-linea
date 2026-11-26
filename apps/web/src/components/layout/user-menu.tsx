"use client";

import Link from "next/link";
import {
  HeartIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutMenuItem } from "@/modules/identity/sign-out-button";

type UserMenuProps = {
  name: string;
  email: string;
  isAdmin: boolean;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menú de cuenta"
            className="bg-secondary text-secondary-foreground rounded-full"
          />
        }
      >
        <span className="text-xs font-semibold">{initialsOf(name)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case">
          <span className="text-foreground text-sm font-medium">{name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/panel" />}>
          <LayoutDashboardIcon />
          Mi panel
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/panel/favoritos" />}>
          <HeartIcon />
          Favoritos
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/panel/mensajes" />}>
          <MessageSquareIcon />
          Mensajes
        </DropdownMenuItem>
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheckIcon />
              Administración
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
