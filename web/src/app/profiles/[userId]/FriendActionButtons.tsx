// FriendActionButtons — Apple-style action buttons for profiles

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
    <div className="space-y-2">
      {/* Friend request button */}
      {!isBlocked && !friendshipStatus && (
        <form action={friendAction} className="w-full">
          <input type="hidden" name="target_user_id" value={targetUserId} />
          <button
            type="submit"
            disabled={friendPending}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50"
          >
            {friendPending ? "Sending…" : "Send Friend Request"}
          </button>
        </form>
      )}

      {/* Friend request status */}
      {friendshipStatus === "pending" && (
        <p className="text-center text-sm text-text-soft">
          Friend request sent, waiting for response
        </p>
      )}
      {friendshipStatus === "accepted" && (
        <div className="space-y-2">
          <p className="text-center text-sm font-medium text-success">
            You&apos;re friends!
          </p>
          <OpenConversationForm partnerId={targetUserId} />
        </div>
      )}

      {/* Block/Unblock */}
      <form action={isBlocked ? unblockAction : blockAction} className="w-full">
        <input type="hidden" name={isBlocked ? "blocked_user_id" : "target_user_id"} value={targetUserId} />
        <button
          type="submit"
          disabled={isBlocked ? unblockPending : blockPending}
          className="w-full rounded-full border border-danger/30 px-5 py-2.5 text-sm font-medium text-danger transition-fast hover:bg-danger-light active:scale-[0.95] disabled:opacity-50"
        >
          {isBlocked
            ? unblockPending ? "Unblocking…" : "Unblock"
            : blockPending ? "Blocking…" : "Block"}
        </button>
      </form>

      {/* Mute/Unmute */}
      <form action={isMuted ? unmuteAction : muteAction} className="w-full">
        <input type="hidden" name={isMuted ? "muted_user_id" : "target_user_id"} value={targetUserId} />
        <button
          type="submit"
          disabled={isMuted ? unmutePending : mutePending}
          className="w-full rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95] disabled:opacity-50"
        >
          {isMuted
            ? unmutePending ? "Unmuting…" : "Unmute"
            : mutePending ? "Muting…" : "Mute"}
        </button>
      </form>

      {/* Report button */}
      <ReportButton targetUserId={targetUserId} />

      {/* Status messages */}
      {friendState && friendState.ok === false && (
        <p className="text-xs text-danger">{friendState.message}</p>
      )}
    </div>
  );
}
