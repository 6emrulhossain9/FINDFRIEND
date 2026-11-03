/** Authenticated app layout: Navbar + Sidebar + content area */

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NotificationItem {
  id: string;
  kind: string;
  created_at: string;
  actor_name: string | null;
  read_at: string | null;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await verifySession();

  let userData: { id: string; display_name: string | null; avatar_url: string | null } | null = null;
  let unreadNotifications = 0;
  const unreadMessages = 0;
  let recentNotifications: NotificationItem[] = [];

  if (session) {
    const supabase = await createServerSupabase();

    const [profileResult, notifResult, notifDataResult] = await Promise.all([
      supabase
        .from("profiles_public")
        .select("display_name, avatar_url")
        .eq("id", session.user.id)
        .single(),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", session.user.id)
        .is("read_at", null),
      supabase
        .from("notifications")
        .select("id, kind, created_at, read_at, actor_id, data")
        .eq("recipient_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    userData = {
      id: session.user.id,
      display_name: profileResult.data?.display_name ?? null,
      avatar_url: profileResult.data?.avatar_url ?? null,
    };
    unreadNotifications = notifResult.count ?? 0;

    // Fetch actor names for the notifications
    const notifs = notifDataResult.data ?? [];
    const actorIds = Array.from(new Set(notifs.map((n) => n.actor_id).filter(Boolean))) as string[];
    const { data: actorProfiles } = actorIds.length
      ? await supabase.from("profiles_public").select("id, display_name").in("id", actorIds)
      : { data: [] as { id: string; display_name: string | null }[] };
    const actorById = new Map((actorProfiles ?? []).map((p) => [p.id, p.display_name]));

    recentNotifications = notifs.map((n) => ({
      id: n.id,
      kind: n.kind,
      created_at: n.created_at,
      actor_name: n.actor_id ? (actorById.get(n.actor_id) ?? "Someone") : null,
      read_at: n.read_at,
    }));
  }

  return (
    <>
      <Navbar
        user={userData}
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
        recentNotifications={recentNotifications}
      />
      <div className="flex min-h-screen pt-16">
        <Sidebar
          user={userData}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
        />
        <div className="min-w-0 flex-1 bg-surface-content pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
