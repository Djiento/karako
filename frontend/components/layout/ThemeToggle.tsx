"use client";

import * as React from "react";
import {
  Check,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Theme = "light" | "dark" | "system";

const themes: {
  value: Theme;
  label: string;
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    label: "Clair",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    icon: Moon,
  },
  {
    value: "system",
    label: "Système",
    icon: Laptop,
  },
];

export function ThemeToggle() {
  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const actualTheme =
    resolvedTheme === "dark"
      ? "dark"
      : "light";

  const CurrentIcon = !mounted
    ? Laptop
    : theme === "system"
      ? Laptop
      : actualTheme === "dark"
        ? Moon
        : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip="Thème"
          className="
            h-10
            w-full
            justify-start
            gap-3
            px-3
          "
        >
          <CurrentIcon
            className="
              size-4
              shrink-0
            "
            strokeWidth={1.9}
          />

          <span className="truncate">
            Thème
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="right"
        className="w-44"
      >
        {themes.map((item) => {
          const Icon = item.icon;

          const active =
            theme === item.value;

          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="gap-2"
            >
              <Icon className="size-4" />

              <span className="flex-1">
                {item.label}
              </span>

              {active && (
                <Check className="size-4" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
