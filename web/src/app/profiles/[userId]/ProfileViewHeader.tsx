// ProfileViewHeader — displays user's profile header with avatar, name, age bracket, bio, interests

"use client";

interface Profile {
  id: string;
  display_name: string;
  age_bracket: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface ProfileViewHeaderProps {
  profile: Profile;
  mutualCount: number;
  interests: string[];
}

export function ProfileViewHeader({ profile, mutualCount, interests }: ProfileViewHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Avatar */}
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="h-48 w-48 rounded-lg object-cover mx-auto"
        />
      ) : (
        <div className="h-48 w-48 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 mx-auto flex items-center justify-center">
          <span className="text-4xl text-zinc-400">👤</span>
        </div>
      )}

      {/* Name and age bracket */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {profile.display_name}, {profile.age_bracket}
        </h1>
        {profile.bio && (
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
        )}
      </div>

      {/* Mutual interests badge */}
      {mutualCount > 0 && (
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-center text-sm font-medium text-green-700 dark:text-green-200">
          ✓ You both like {mutualCount} of the same {mutualCount === 1 ? "thing" : "things"}
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <span
                key={idx}
                className="inline-block rounded-full bg-zinc-200 dark:bg-zinc-700 px-3 py-1 text-sm text-zinc-800 dark:text-zinc-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
