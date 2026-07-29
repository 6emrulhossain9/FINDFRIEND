// ProfileViewHeader — Apple-style profile header

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
    <div className="space-y-5">
      {/* Avatar */}
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="h-40 w-40 rounded-xl object-cover mx-auto ring-2 ring-white dark:ring-black"
        />
      ) : (
        <div className="h-40 w-40 rounded-xl bg-surface-hover mx-auto flex items-center justify-center ring-2 ring-white dark:ring-black">
          <span className="text-4xl text-text-soft">👤</span>
        </div>
      )}

      {/* Name and age bracket */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-main">
          {profile.display_name}
        </h1>
        {profile.age_bracket && (
          <p className="text-sm text-text-soft">{profile.age_bracket}</p>
        )}
        {profile.bio && (
          <p className="mt-2 text-sm text-text-soft max-w-md mx-auto leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* Mutual interests badge */}
      {mutualCount > 0 && (
        <div className="rounded-full bg-success-light px-4 py-2 text-center text-sm font-medium text-success">
          ✓ You both like {mutualCount} of the same {mutualCount === 1 ? "thing" : "things"}
        </div>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-main">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <span
                key={idx}
                className="inline-block rounded-full bg-surface-hover px-3 py-1.5 text-sm text-text-soft"
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
