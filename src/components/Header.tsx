"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

type Props = {
  userName: string;
  userAvatar?: string | null;
};

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "moon":
      return <svg {...common}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
    case "menu":
      return <svg {...common}><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>;
    case "close":
      return <svg {...common}><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>;
    case "stack":
      return <svg {...common}><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 21V9a2 2 0 0 1 2-2h12"/></svg>;
    case "feed":
      return <svg {...common}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>;
    case "share":
      return <svg {...common}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>;
    default:
      return null;
  }
}

export function Header({ userName, userAvatar }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("ca-theme") as "dark" | "light" | null;
    setTheme(stored ?? "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ca-theme", next);
  }

  const isAlbums = pathname === "/album" || pathname.startsWith("/album/");
  const isFeed = pathname === "/feed";

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/album" className="brand" style={{ textDecoration: "none" }}>
            <span className="brand-mark">C</span>
            <span className="brand-name">Class <em>Album</em></span>
          </Link>

          <nav className="nav-links">
            <Link href="/album" className={`nav-link ${isAlbums ? "active" : ""}`}>
              Albums
            </Link>
            <Link href="/feed" className={`nav-link ${isFeed ? "active" : ""}`}>
              Feed
            </Link>
          </nav>

          <div className="header-spacer" />

          {/* mobile menu trigger */}
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
          >
            <Icon name="menu" size={18} />
          </button>

          {/* theme toggle */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          </button>

          {/* user chip */}
          <div className="user-chip">
            {userAvatar ? (
              <img className="avatar-img" src={userAvatar} alt={userName} />
            ) : (
              <div
                className="avatar-img"
                style={{
                  background: "var(--sepia-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--cream-50)",
                }}
              >
                {userName[0]?.toUpperCase()}
              </div>
            )}
            <span className="chip-name">{userName}</span>
            <button
              className="chip-signout"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet menu */}
      {menuOpen && (
        <>
          <div className="sheet-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="sheet" role="dialog">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px 12px",
                borderBottom: "1px solid var(--border-soft)",
                marginBottom: 6,
              }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  style={{ width: 36, height: 36, borderRadius: 999 }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "var(--sepia-500)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--cream-50)",
                  }}
                >
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text-1)", fontSize: 14 }}>{userName}</div>
              </div>
              <button className="icon-btn" onClick={() => setMenuOpen(false)}>
                <Icon name="close" size={16} />
              </button>
            </div>

            <Link
              href="/album"
              className={`sheet-item ${isAlbums ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="stack" size={18} /> Albums
            </Link>
            <Link
              href="/feed"
              className={`sheet-item ${isFeed ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="feed" size={18} /> Feed
            </Link>
            <button
              className="sheet-item"
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>

            <div style={{ height: 1, background: "var(--border-soft)", margin: "6px 6px" }} />

            <button
              className="sheet-item"
              style={{ color: "var(--text-3)" }}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <Icon name="share" size={18} /> Sign out
            </button>
          </div>
        </>
      )}
    </>
  );
}
