import Link from "next/link";
import { redirect } from "next/navigation";

import { markNotificationsReadAction } from "@/app/actions/messages";
import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";

interface NotificationRow {
  id: string;
  kind: string;
  entity_type: string;
  entity_id: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  actor_id: string | null;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
}

export default async function NotificationsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/notifications");
  }

  const supabase = await createServerSupabase();
  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("id, kind, entity_type, entity_id, data, read_at, created_at, actor_id")
    .eq("recipient_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (notificationsData ?? []) as NotificationRow[];
  const actorIds = Array.from(new Set(notifications.map((item) => item.actor_id).filter(Boolean))) as string[];

  const { data: actorProfilesData } = actorIds.length
    ? await supabase.from("profiles_public").select("id, display_name").in("id", actorIds)
    : { data: [] as ProfileRow[] };
  const actorById = new Map((actorProfilesData ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-text-soft">
            Recent activity across your conversations and friendships.
          </p>
        </div>
        <form action={markNotificationsReadAction}>
          <button
            type="submit"
            className="rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.97]"
          >
            Mark all read
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-base p-8 text-center text-sm text-text-tertiary">
            Nothing yet.
          </p>
        ) : (
          notifications.map((notification) => {
            const actor = notification.actor_id ? actorById.get(notification.actor_id) : null;
            const label =
              notification.kind === "message"
                ? "New message"
                : notification.kind === "friend_request"
                  ? "Friend request"
                  : "Friend request accepted";
            const href =
              notification.kind === "message" && notification.data.conversation_id
                ? `/messages/${notification.data.conversation_id}`
                : "/account";

            return (
              <Link
                key={notification.id}
                href={href}
                className={`block rounded-xl border p-4 transition-fast hover:bg-surface-hover ${
                  notification.read_at
                    ? "border-border-base bg-surface-card"
                    : "border-accent/30 bg-surface-hover"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-1 text-sm text-text-soft">
                      {actor?.display_name ?? "Someone"}
                      {notification.kind === "message" ? " sent you a message." : "."}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
