"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  CalendarClockIcon,
  HeartIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboardIcon },
  { href: "/panel/inmuebles", label: "Mis inmuebles", icon: Building2Icon },
  { href: "/panel/mensajes", label: "Mensajes", icon: MessageSquareIcon },
  { href: "/panel/visitas", label: "Visitas", icon: CalendarClockIcon },
  { href: "/panel/favoritos", label: "Favoritos", icon: HeartIcon },
  { href: "/panel/perfil", label: "Perfil", icon: UserIcon },
  {
    href: "/admin",
    label: "Administración",
    icon: ShieldCheckIcon,
    adminOnly: true,
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PanelNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav
      className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
      aria-label="Panel"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
