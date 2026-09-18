"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  CheckSquare,
  FolderKanban,
  Inbox,
  Lightbulb,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    label: "Mes idées",
    href: "/ideas",
    icon: Lightbulb,
  },
  {
    label: "Projets",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Tâches",
    href: "/tasks",
    icon: CheckSquare,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Sparkles size={18} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Karako
          </h1>
          <p className="text-[10px] text-slate-500">
            Idea Operating System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-slate-100" />

        <Link
          href="/archive"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Archive size={18} />
          Archives
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings size={18} />
          Paramètres
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-3">
        {user && (
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.first_name || user.email}
            </p>

            <p className="truncate text-xs text-slate-500">
              {user.email}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}