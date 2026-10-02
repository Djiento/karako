"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  CheckSquare,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const mainNavigation: NavigationItem[] = [
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
    label: "Recherche",
    href: "/research",
    icon: Search,
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

const systemNavigation: NavigationItem[] = [
  {
    label: "Archives",
    href: "/archive",
    icon: Archive,
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function NavigationGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavigationItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {label}
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;

            const active = isActivePath(
              pathname,
              item.href,
            );

            return (
              <SidebarMenuItem
                key={item.href}
                data-active={active}
              >
                <SidebarMenuButton
                  tooltip={item.label}
                  render={
                    <Link
                      href={item.href}
                      className="
                        h-10
                        w-full
                        justify-start
                        gap-3
                        px-3
                      "
                    />
                  }
                >
                  <Icon
                    className="size-7 shrink-0"
                    strokeWidth={1.5}
                  />

                  <span className="truncate">
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName =
    user?.first_name ||
    user?.email ||
    "Utilisateur";

  const initials = displayName
    .charAt(0)
    .toUpperCase();

  return (
    <ShadcnSidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r"
    >
      {/* ================================
          HEADER
      ================================= */}

      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Karako"
              className="
                h-12
                justify-start
                gap-3
                px-2
              "
              render={
                <Link
                  href="/dashboard"
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                  "
                />
              }
            >
              <div
                className="
                  flex
                  size-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary
                  text-primary-foreground
                "
              >
                <Sparkles
                  className="size-4"
                  strokeWidth={2}
                />
              </div>

              <div
                className="
                  grid
                  min-w-0
                  flex-1
                  text-left
                  leading-tight
                "
              >
                <span
                  className="
                    truncate
                    text-sm
                    font-semibold
                  "
                >
                  Karako
                </span>

                <span
                  className="
                    truncate
                    text-[11px]
                    text-muted-foreground
                  "
                >
                  Système d'exploitation d'idées
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ================================
          CONTENT
      ================================= */}

      <SidebarContent>
        <NavigationGroup
          label="Espace de travail"
          items={mainNavigation}
          pathname={pathname}
        />

        <NavigationGroup
          label="Système"
          items={systemNavigation}
          pathname={pathname}
        />
      </SidebarContent>

      {/* ================================
          FOOTER
      ================================= */}

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {/* USER */}

          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={displayName}
                className="
                  h-11
                  justify-start
                  gap-3
                  px-2
                "
              >
                <div
                  className="
                    flex
                    size-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-muted
                  "
                >
                  <span className="text-xs font-semibold">
                    {initials}
                  </span>
                </div>

                <div
                  className="
                    grid
                    min-w-0
                    flex-1
                    text-left
                    leading-tight
                  "
                >
                  <span
                    className="
                      truncate
                      text-sm
                      font-medium
                    "
                  >
                    {displayName}
                  </span>

                  <span
                    className="
                      truncate
                      text-[11px]
                      text-muted-foreground
                    "
                  >
                    {user.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* THEME */}

          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>

          {/* LOGOUT */}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Déconnexion"
              onClick={signOut}
              className="
                h-10
                justify-start
                gap-3
                px-3
                text-muted-foreground
                hover:bg-destructive/10
                hover:text-destructive
              "
            >
              <LogOut
                className="size-4 shrink-0"
                strokeWidth={1.9}
              />

              <span>
                Déconnexion
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
