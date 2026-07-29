/** Apple-style sidebar navigation */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Compass, Mail, Bell, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  user: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
  unreadNotifications?: number;
  unreadMessages?: number;
}

const navItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "messages" | "notifications";
}> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/messages", label: "Messages", icon: Mail, badgeKey: "messages" },
  { href: "/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" },
];

export function Sidebar({
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getBadgeCount = (badgeKey?: "messages" | "notifications") => {
    if (badgeKey === "messages") return unreadMessages;
    if (badgeKey === "notifications") return unreadNotifications;
    return 0;
  };

  return (
    <aside className="hidden md:flex md:w-[240px] shrink-0 flex-col sticky top-11 h-[calc(100vh-3.5rem)] overflow-y-auto py-4 px-2 border-r border-border-base bg-surface">
      {/* User pill */}
      {user && (
        <Link
          href={`/profiles/${user.id}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-hover transition-fast mb-4"
        >
          <Avatar src={user.avatar_url} alt={user.display_name ?? "User"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user.display_name ?? "User"}
            </p>
            <p className="text-xs text-text-soft">View profile</p>
          </div>
        </Link>
      )}

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badgeCount = getBadgeCount(item.badgeKey);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-fast ${
                active
                  ? "bg-surface-hover text-accent"
                  : "text-text-main hover:bg-surface-hover"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-accent animate-scale-in" />
              )}
              <span className="relative">
                <Icon className="h-5 w-5" />
                {badgeCount > 0 && <Badge count={badgeCount} />}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sign out */}
      <Link
        href="/signout"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-soft hover:bg-surface-hover transition-fast"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </Link>
    </aside>
  );
}
