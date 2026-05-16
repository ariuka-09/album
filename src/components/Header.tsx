"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  userName: string;
  userAvatar?: string | null;
};

export function Header({ userName, userAvatar }: Props) {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname.startsWith(href)
          ? "text-white"
          : "text-white/60 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/album" className="font-semibold text-white text-sm">
            📸 Album
          </Link>
          {navLink("/album", "Albums")}
          {navLink("/feed", "Feed")}
        </div>
        <div className="flex items-center gap-2">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center text-xs text-white font-bold">
              {userName[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-white/70 text-sm hidden sm:block">
            {userName}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/50 hover:text-white text-sm ml-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
