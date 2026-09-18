"use client";

import { Bell, Plus } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">
          Ton espace de réflexion
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <Link
          href="/ideas/new"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Nouvelle idée
        </Link>
      </div>
    </header>
  );
}