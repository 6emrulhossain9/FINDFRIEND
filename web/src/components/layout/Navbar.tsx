"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Globe2, LogOut, Settings, UserRound } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface NotificationItem { id: string; kind: string; created_at: string; actor_name: string | null; read_at: string | null; }
interface NavbarProps {
  user: { id: string; display_name?: string | null; avatar_url?: string | null } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
  recentNotifications?: NotificationItem[];
}

const notifLabel: Record<string, string> = { message: "New message", friend_request: "Friend request", friend_request_accepted: "Request accepted" };
function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Navbar({ user, unreadNotifications = 0, unreadMessages = 0, recentNotifications = [] }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenus(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key === "Escape") { setMenuOpen(false); setNotifOpen(false); return; }
      if (event instanceof MouseEvent) {
        const target = event.target as Node;
        if (!menuRef.current?.contains(target)) setMenuOpen(false);
        if (!notifRef.current?.contains(target)) setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeMenus);
    return () => { document.removeEventListener("mousedown", closeMenus); document.removeEventListener("keydown", closeMenus); };
  }, []);

  return (
    <header className="global-nav glass fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg font-bold tracking-tight text-text-main">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white"><Globe2 aria-hidden="true" className="h-5 w-5" /></span>
          <span>Friendnet</span>
        </Link>
        {user ? <div className="flex items-center gap-1 sm:gap-2">
          <div ref={notifRef} className="relative">
            <button type="button" onClick={() => { setNotifOpen((open) => !open); setMenuOpen(false); }} aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"} aria-expanded={notifOpen} aria-controls="friendnet-notifications-menu" className="relative grid h-10 w-10 place-items-center rounded-full text-text-soft transition-fast hover:bg-surface-hover hover:text-accent"><Bell aria-hidden="true" className="h-5 w-5" />{unreadNotifications > 0 ? <Badge count={unreadNotifications} /> : null}</button>
            {notifOpen ? <section id="friendnet-notifications-menu" aria-label="Recent notifications" className="absolute right-0 top-full mt-2 w-[min(21rem,calc(100vw-1.5rem))] origin-top-right animate-scale-in rounded-2xl border border-border-base bg-surface-card p-2 shadow-dropdown">
              <div className="flex items-center justify-between border-b border-separator px-3 py-2"><p className="text-sm font-semibold">Activity</p><Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-semibold text-accent hover:underline">See all</Link></div>
              {recentNotifications.length ? <ul className="max-h-80 overflow-y-auto py-1">{recentNotifications.map((item) => <li key={item.id}><Link href={item.kind === "message" ? "/messages" : "/account"} onClick={() => setNotifOpen(false)} className={`flex flex-col gap-1 rounded-xl px-3 py-3 transition-fast hover:bg-surface-hover ${item.read_at ? "" : "bg-success-light/60"}`}><span className="text-sm font-medium">{notifLabel[item.kind] ?? "Community update"}</span><span className="text-xs text-text-soft">{item.actor_name ?? "A friend"} · {timeAgo(item.created_at)}</span></Link></li>)}</ul> : <p className="px-3 py-8 text-center text-sm text-text-soft">Your updates will show up here.</p>}
            </section> : null}
          </div>

          <Link href="/messages" aria-label={unreadMessages ? `Messages, ${unreadMessages} unread` : "Messages"} className="relative grid h-10 w-10 place-items-center rounded-full text-text-soft transition-fast hover:bg-surface-hover hover:text-accent"><span className="sr-only">Messages</span><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></svg>{unreadMessages > 0 ? <Badge count={unreadMessages} /> : null}</Link>

          <div ref={menuRef} className="relative ml-1">
            <button type="button" onClick={() => { setMenuOpen((open) => !open); setNotifOpen(false); }} aria-label="Open account menu" aria-expanded={menuOpen} aria-controls="friendnet-account-menu" className="flex min-h-10 items-center gap-2 rounded-full p-1 transition-fast hover:bg-surface-hover">
              <Avatar src={user.avatar_url} alt={user.display_name ?? "Your profile"} size="sm" />
              <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{user.display_name ?? "Your profile"}</span>
              <ChevronDown aria-hidden="true" className={`mr-1 h-4 w-4 text-text-tertiary transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen ? <div id="friendnet-account-menu" className="absolute right-0 top-full mt-2 w-56 origin-top-right animate-scale-in rounded-2xl border border-border-base bg-surface-card p-2 shadow-dropdown">
              <p className="truncate px-3 py-2 text-xs font-medium text-text-tertiary">Signed in as <span className="block truncate text-sm font-semibold text-text-main">{user.display_name ?? "Friend"}</span></p>
              <Link href={`/profiles/${user.id}`} onClick={() => setMenuOpen(false)} className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-fast hover:bg-surface-hover"><UserRound aria-hidden="true" className="h-4 w-4 text-text-soft" />Your profile</Link>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-fast hover:bg-surface-hover"><Settings aria-hidden="true" className="h-4 w-4 text-text-soft" />Account settings</Link>
              <form action={signOutAction} className="mt-1 border-t border-separator pt-1"><button type="submit" className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-danger transition-fast hover:bg-danger-light"><LogOut aria-hidden="true" className="h-4 w-4" />Sign out</button></form>
            </div> : null}
          </div>
        </div> : <Link href="/login" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-fast hover:bg-accent-dark">Sign in</Link>}
      </div>
    </header>
  );
}
