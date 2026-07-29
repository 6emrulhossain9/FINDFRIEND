/** Apple global-nav with notification dropdown */

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Bell, Mail, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface NotificationItem {
  id: string;
  kind: string;
  created_at: string;
  actor_name: string | null;
  read_at: string | null;
}

interface NavbarProps {
  user: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
  recentNotifications?: NotificationItem[];
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

const notifLabel: Record<string, string> = {
  message: "New message",
  friend_request: "Friend request",
  friend_request_accepted: "Request accepted",
};

export function Navbar({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
  recentNotifications = [],
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-surface-black">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="text-sm font-semibold tracking-wide">ViCo</span>
        </Link>

        {/* Right side icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <>
              {/* Notifications dropdown */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative rounded-full p-1.5 text-white/70 hover:text-white transition-fast"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && <Badge count={unreadNotifications} />}
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-80 rounded-xl bg-surface-card p-2 shadow-dropdown border border-border-base transition-all duration-150 ease-out origin-top-right ${
                    notifOpen
                      ? "scale-100 opacity-100 pointer-events-auto"
                      : "scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-separator">
                    <p className="text-sm font-semibold text-text-main">Notifications</p>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-text-soft">
                        No notifications yet
                      </p>
                    ) : (
                      recentNotifications.map((n) => (
                        <Link
                          key={n.id}
                          href={
                            n.kind === "message"
                              ? "/messages"
                              : "/account"
                          }
                          onClick={() => setNotifOpen(false)}
                          className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-sm transition-fast hover:bg-surface-hover ${
                            n.read_at ? "" : "bg-accent/5"
                          }`}
                        >
                          <span className="text-xs font-semibold text-text-main">
                            {notifLabel[n.kind] ?? n.kind}
                          </span>
                          <span className="text-xs text-text-soft">
                            {n.actor_name ?? "Someone"}
                          </span>
                          <span className="text-[11px] text-text-tertiary">
                            {timeAgo(n.created_at)}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="border-t border-separator mt-1 pt-1">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-accent hover:bg-surface-hover transition-fast"
                    >
                      See all notifications
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/messages"
                className="relative rounded-full p-1.5 text-white/70 hover:text-white transition-fast"
                aria-label="Messages"
              >
                <Mail className="h-4 w-4" />
                {unreadMessages > 0 && <Badge count={unreadMessages} />}
              </Link>

              {/* Avatar dropdown */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 rounded-full p-0.5 hover:bg-white/10 transition-fast"
                  aria-label="User menu"
                >
                  <Avatar
                    src={user.avatar_url}
                    alt={user.display_name ?? "User"}
                    size="sm"
                  />
                  <ChevronDown className={`h-3 w-3 text-white/70 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface-card p-2 shadow-dropdown border border-border-base transition-all duration-150 ease-out origin-top-right ${
                    menuOpen
                      ? "scale-100 opacity-100 pointer-events-auto"
                      : "scale-95 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-separator mb-1">
                    <p className="text-sm font-semibold truncate text-text-main">
                      {user.display_name ?? "User"}
                    </p>
                  </div>

                    <Link
                      href={`/profiles/${user.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-main hover:bg-surface-hover transition-fast"
                    >
                      <User className="h-4 w-4 text-text-soft" />
                      Your Profile
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-main hover:bg-surface-hover transition-fast"
                    >
                      <Settings className="h-4 w-4 text-text-soft" />
                      Account Settings
                    </Link>

                    <div className="border-t border-separator mt-1 pt-1">
                      <Link
                        href="/signout"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-light transition-fast"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Link>
                    </div>
                  </div>
                </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-sm bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-fast"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
