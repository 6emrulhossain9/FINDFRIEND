// FriendActionButtons — handles friend requests, block, mute, report

"use client";

import { useActionState } from "react";

import {
  sendFriendRequest,
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
} from "@/app/actions/social";
import { OpenConversationForm } from "@/app/messages/OpenConversationForm";
import { ReportButton } from "./ReportButton";

interface FriendActionButtonsProps {
  targetUserId: string;
  isBlocked: boolean;
  isMuted: boolean;
  friendshipStatus?: "pending" | "accepted" | "blocked" | "declined" | null;
}

export function FriendActionButtons({
  targetUserId,
  isBlocked,
  isMuted,
  friendshipStatus,
}: FriendActionButtonsProps) {
  const [friendState, friendAction, friendPending] = useActionState(
    sendFriendRequest,
    undefined
  );

  const [, blockAction, blockPending] = useActionState(blockUser, undefined);
  const [, unblockAction, unblockPending] = useActionState(unblockUser, undefined);
  const [, muteAction, mutePending] = useActionState(muteUser, undefined);
  const [, unmuteAction, unmutePending] = useActionState(unmuteUser, undefined);

  return (
    <div className="space-y-3">
      {/* Friend request button */}
      {!isBlocked && !friendshipStatus && (
        <form action={friendAction} className="w-full">
          <input type="hidden" name="target_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={friendPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-opacity hover:bg-blue-700 disabled:opacity-60"
          >
            {friendPending ? "Sending…" : "Send Friend Request"}
          </button>
        </form>
      )}

      {/* Friend request status */}
      {friendshipStatus === "pending" && (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Friend request sent, waiting for response
        </p>
      )}
      {friendshipStatus === "accepted" && (
        <div className="space-y-2">
          <p className="text-center text-sm text-green-600 dark:text-green-400">
            You&apos;re friends!
          </p>
          <OpenConversationForm partnerId={targetUserId} />
        </div>
      )}

      {/* Block/Unblock button */}
      {isBlocked ? (
        <form action={unblockAction} className="w-full">
          <input type="hidden" name="blocked_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={unblockPending}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm transition-opacity hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-60"
          >
            {unblockPending ? "Unblocking…" : "Unblock"}
          </button>
        </form>
      ) : (
        <form action={blockAction} className="w-full">
          <input type="hidden" name="target_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={blockPending}
            className="w-full rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 transition-opacity hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-60"
          >
            {blockPending ? "Blocking…" : "Block"}
          </button>
        </form>
      )}

      {/* Mute/Unmute button */}
      {isMuted ? (
        <form action={unmuteAction} className="w-full">
          <input type="hidden" name="muted_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={unmutePending}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm transition-opacity hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-60"
          >
            {unmutePending ? "Unmuting…" : "Unmute"}
          </button>
        </form>
      ) : (
        <form action={muteAction} className="w-full">
          <input type="hidden" name="target_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={mutePending}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm transition-opacity hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-60"
          >
            {mutePending ? "Muting…" : "Mute"}
          </button>
        </form>
      )}

      {/* Report button — opens a dialog with reason + description */}
      <ReportButton targetUserId={targetUserId} />

      {/* Status messages */}
      {friendState && friendState.ok === false && (
        <p className="text-xs text-red-600">{friendState.message}</p>
      )}
    </div>
  );
}
