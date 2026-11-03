"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, House, Mail, Newspaper, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  user: { id: string; display_name?: string | null; avatar_url?: string | null } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
}

const navItems = [
  { href: "/feed", label: "Home feed", icon: Newspaper },
  { href: "/discover", label: "Discover people", icon: Compass },
  { href: "/messages", label: "Messages", icon: Mail, badge: "messages" as const },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: "notifications" as const },
];

export function Sidebar({ user, unreadNotifications = 0, unreadMessages = 0 }: SidebarProps) {
  const pathname = usePathname();
  const badgeCount = (key?: "messages" | "notifications") => key === "messages" ? unreadMessages : key === "notifications" ? unreadNotifications : 0;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const links = navItems.map(({ href, label, icon: Icon, badge }) => {
    const active = isActive(href);
    const count = badgeCount(badge);
    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-fast ${active ? "bg-success-light text-accent" : "text-text-soft hover:bg-surface-hover hover:text-text-main"}`}>
        <span className="relative"><Icon aria-hidden="true" className="h-5 w-5" />{count > 0 ? <Badge count={count} /> : null}</span>
        <span>{label}</span>
      </Link>
    );
  });

  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-border-base bg-surface-card px-3 py-5 md:flex">
        {user ? <Link href={`/profiles/${user.id}`} className="mb-5 flex items-center gap-3 rounded-xl px-2 py-3 transition-fast hover:bg-surface-hover"><Avatar src={user.avatar_url} alt={user.display_name ?? "Your profile"} size="md" /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-text-main">{user.display_name ?? "Your profile"}</span><span className="mt-0.5 block text-xs text-text-soft">View your profile</span></span></Link> : null}
        <nav aria-label="Main navigation" className="flex flex-col gap-1">{links}</nav>
        <div className="mt-auto rounded-2xl bg-success-light/70 p-4"><p className="text-sm font-semibold text-text-main">A good place to begin</p><p className="mt-1.5 text-xs leading-5 text-text-soft">Share something you love. Your next friendship could start there.</p><Link href="/feed" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">Open your feed <House aria-hidden="true" className="h-3.5 w-3.5" /></Link></div>
      </aside>

      <nav aria-label="Mobile navigation" className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t px-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 md:hidden">
        {[
          { href: "/feed", label: "Feed", icon: Newspaper },
          { href: "/discover", label: "Discover", icon: Compass },
          { href: "/messages", label: "Chats", icon: Mail },
          { href: "/notifications", label: "Activity", icon: Bell },
          { href: user ? `/profiles/${user.id}` : "/account", label: "You", icon: UserRound },
        ].map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-fast ${active ? "text-accent" : "text-text-tertiary"}`}><Icon aria-hidden="true" className="h-5 w-5" /><span>{label}</span></Link>;
        })}
      </nav>
    </>
  );
}
