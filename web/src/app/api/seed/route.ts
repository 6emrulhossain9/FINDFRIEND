// Seed route — creates demo data for local development.
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
// Only works in development mode.
// Visit /api/seed to run it.

import { createClient } from "@supabase/supabase-js";

// ─── Demo Users ────────────────────────────────────────

const DEMO_USERS = [
  {
    email: "alex@vico.demo",
    password: "DemoPass123!",
    display_name: "Alex Morgan",
    date_of_birth: "1997-05-12",
    bio: "Photographer & coffee enthusiast. Love hiking on weekends and exploring new places. Based in NYC.",
    avatar_url: null,
    interests: [1, 2, 3], // Photography, Hiking, Coffee
    onboarding_state: "active",
  },
  {
    email: "sarah@vico.demo",
    password: "DemoPass123!",
    display_name: "Sarah Chen",
    date_of_birth: "2001-11-03",
    bio: "Software engineer by day, indie game dev by night. Ask me about my cat.",
    avatar_url: null,
    interests: [7, 8, 10], // Coding, Gaming, Music
    onboarding_state: "active",
  },
  {
    email: "jordan@vico.demo",
    password: "DemoPass123!",
    display_name: "Jordan Rivera",
    date_of_birth: "2003-07-28",
    bio: "Art student and amateur chef. I believe every meal should be plated like a masterpiece.",
    avatar_url: null,
    interests: [1, 4, 6], // Photography, Cooking, Baking
    onboarding_state: "active",
  },
  {
    email: "maya@vico.demo",
    password: "DemoPass123!",
    display_name: "Maya Patel",
    date_of_birth: "1998-02-19",
    bio: "Yoga instructor & bookworm. If I'm not on my mat, I probably have my nose in a novel.",
    avatar_url: null,
    interests: [5, 9, 11], // Yoga, Reading, Running
    onboarding_state: "active",
  },
  {
    email: "taylor@vico.demo",
    password: "DemoPass123!",
    display_name: "Taylor Kim",
    date_of_birth: "2006-09-15",
    bio: "College student studying environmental science. Let's talk about sustainability and good music.",
    avatar_url: null,
    interests: [3, 10, 11], // Coffee, Music, Running
    onboarding_state: "active",
  },
];

// ─── Demo Posts ────────────────────────────────────────

const DEMO_POSTS: Array<{ author_index: number; content: string }> = [
  {
    author_index: 0, // Alex
    content:
      "Just got back from an incredible hike in the Adirondacks! The fall colors were absolutely breathtaking. 🍁\n\nAnyone else here love hiking? Would love to find some trail buddies!",
  },
  {
    author_index: 1, // Sarah
    content:
      "Finally shipped the feature I've been working on for 3 weeks. 🎉\n\nNothing beats that feeling when your code compiles AND works on the first try. Almost makes up for the 47 failed attempts before it.",
  },
  {
    author_index: 2, // Jordan
    content:
      "Made homemade ramen from scratch today! 16-hour broth, hand-pulled noodles, chashu pork that melts in your mouth.\n\nDrop your favorite comfort food recipes below — I need new challenges! 🍜",
  },
  {
    author_index: 3, // Maya
    content:
      "Morning yoga in the park hits different. 🌅\n\nThere's something special about practicing while the sun comes up and the birds are just starting their day. Highly recommend trying it at least once.",
  },
  {
    author_index: 4, // Taylor
    content:
      "Just finished a beach cleanup event with my environmental club. We collected 87 pounds of trash in just 3 hours!\n\nSmall actions add up. What's one thing you do to reduce waste? ♻️",
  },
  {
    author_index: 0, // Alex
    content:
      "New camera day! 📸\n\nJust upgraded my body and I'm absolutely in love. The low-light performance is insane. Who else here shoots mirrorless? Let's talk gear!",
  },
  {
    author_index: 1, // Sarah
    content:
      "Hot take: The original Pokemon games still hold up better than most modern RPGs. \n\nI will die on this hill. Fight me. 🎮",
  },
  {
    author_index: 2, // Jordan
    content:
      "Tried a new recipe today — saffron risotto with seared scallops. \n\nPro tip: never skip the step where you toast the rice first. Game changer. 🧑‍🍳",
  },
  {
    author_index: 3, // Maya
    content:
      "Book recommendation thread! 📚\n\nJust finished 'Project Hail Mary' by Andy Weir and it was PHENOMENAL. What's the best book you've read this year?",
  },
  {
    author_index: 4, // Taylor
    content:
      "Hot take: cold brew is better than iced coffee. \n\nIt's smoother, less acidic, and you can actually taste the coffee notes instead of just 'burnt ice water'. ☕",
  },
];

// ─── Demo Comments ─────────────────────────────────────

const DEMO_COMMENTS: Array<{
  post_index: number;
  author_index: number;
  content: string;
}> = [
  { post_index: 0, author_index: 1, content: "Those colors are stunning! Where in the Adirondacks was this?" },
  { post_index: 0, author_index: 3, content: "I'd love to join a group hike sometime! 🙋‍♀️" },
  { post_index: 1, author_index: 0, content: "Congrats Sarah! That feeling never gets old." },
  { post_index: 1, author_index: 2, content: "The 47 failed attempts make the victory so much sweeter 😂" },
  { post_index: 2, author_index: 4, content: "That sounds incredible! Can you share the recipe?" },
  { post_index: 2, author_index: 3, content: "16-hour broth?! That's dedication. Bet it was worth it." },
  { post_index: 3, author_index: 0, content: "What time do you usually go? I'd love to join!" },
  { post_index: 4, author_index: 1, content: "Amazing work! I bring reusable bags everywhere now." },
  { post_index: 5, author_index: 4, content: "Ooh what body did you get? I shoot Sony!" },
  { post_index: 5, author_index: 2, content: "The bokeh in that first shot must be incredible." },
  { post_index: 6, author_index: 3, content: "Gen 3 was my first! Still have my Game Boy Color." },
  { post_index: 6, author_index: 0, content: "Gold/Silver or bust. The day/night cycle was revolutionary!" },
  { post_index: 7, author_index: 1, content: "Saffron risotto is on my bucket list to make! Any tips?" },
  { post_index: 8, author_index: 2, content: "Added to my reading list! Have you read 'Dark Matter' by Blake Crouch?" },
  { post_index: 9, author_index: 0, content: "Fully agree! Cold brew is way smoother. Try it with oat milk 🤌" },
];

// ─── Helper: seeded pseudo-random for deterministic data ──

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rand = seededRandom(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

export async function GET() {
  // Guard: only in development
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Seeding is only available in development" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        error: "Missing env vars. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.\n" +
          "Get it from: https://supabase.com/dashboard/project/kutlxzwzunrarqcppjnf/settings/api",
      },
      { status: 400 },
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: string[] = [];
  const userIds: string[] = [];

  try {
    // ── Step 1: Create demo auth users ──
    for (const user of DEMO_USERS) {
      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      if (error) {
        // If user already exists, try to get them
        if (error.message.includes("already been registered")) {
          const { data: existing } = await admin.auth.admin.listUsers();
          const found = existing?.users.find((u) => u.email === user.email);
          if (found) {
            userIds.push(found.id);
            results.push(`User ${user.email} already exists (id: ${found.id.slice(0, 8)}…)`);
            continue;
          }
        }
        throw new Error(`Failed to create user ${user.email}: ${error.message}`);
      }
      userIds.push(data.user.id);
      results.push(`Created user ${user.email} (id: ${data.user.id.slice(0, 8)}…)`);
    }

    // ── Step 2: Create profiles ──
    for (let i = 0; i < DEMO_USERS.length; i++) {
      const user = DEMO_USERS[i];
      const { error } = await admin.from("profiles").upsert({
        id: userIds[i],
        display_name: user.display_name,
        date_of_birth: user.date_of_birth,
        bio: user.bio,
        avatar_url: user.avatar_url,
        onboarding_state: user.onboarding_state,
      });
      if (error) throw new Error(`Profile insert failed for ${user.email}: ${error.message}`);
      results.push(`Profile created for ${user.display_name}`);
    }

    // ── Step 3: Assign interests ──
    for (let i = 0; i < DEMO_USERS.length; i++) {
      const interestRows = DEMO_USERS[i].interests.map((interestId) => ({
        user_id: userIds[i],
        interest_id: String(interestId),
      }));
      const { error } = await admin.from("user_interests").upsert(interestRows, {
        onConflict: "user_id, interest_id",
      });
      if (error) console.error(`Interest insert warning for user ${i}:`, error.message);
    }
    results.push(`Interests assigned to all users`);

    // ── Step 4: Create posts ──
    const postIds: string[] = [];
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < DEMO_POSTS.length; i++) {
      const post = DEMO_POSTS[i];
      const createdAt = new Date(twoWeeksAgo + rand() * (Date.now() - twoWeeksAgo)).toISOString();
      const { data, error } = await admin
        .from("posts")
        .insert({
          author_id: userIds[post.author_index],
          content: post.content,
          created_at: createdAt,
        })
        .select("id")
        .single();

      if (error) throw new Error(`Post insert failed: ${error.message}`);
      postIds.push(data.id);
      results.push(`Post ${i + 1}: "${post.content.slice(0, 40)}…"`);
    }

    // ── Step 5: Add reactions ──
    const reactionTypes = ["like", "love", "haha", "wow", "sad"] as const;
    let reactionCount = 0;

    for (const postId of postIds) {
      // Each post gets 2-5 reactions from random users
      const numReactions = Math.floor(rand() * 4) + 2;
      const usedCombos = new Set<string>();

      for (let r = 0; r < numReactions; r++) {
        const reactorIdx = Math.floor(rand() * DEMO_USERS.length);
        const reactionType = pick([...reactionTypes]);
        const key = `${reactorIdx}-${reactionType}`;
        if (usedCombos.has(key)) continue;
        usedCombos.add(key);

        const { error } = await admin.from("post_reactions").insert({
          post_id: postId,
          user_id: userIds[reactorIdx],
          reaction_type: reactionType,
        });
        if (!error) reactionCount++;
      }
    }
    results.push(`${reactionCount} reactions added`);

    // ── Step 6: Add comments ──
    let commentCount = 0;
    const commentIds: string[] = [];

    for (const comment of DEMO_COMMENTS) {
      const createdAt = new Date(Date.now() - rand() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await admin
        .from("comments")
        .insert({
          post_id: postIds[comment.post_index],
          author_id: userIds[comment.author_index],
          content: comment.content,
          created_at: createdAt,
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Comment insert warning: ${error.message}`);
        continue;
      }
      commentIds.push(data.id);
      commentCount++;
    }
    results.push(`${commentCount} comments added`);

    // ── Step 7: Add comment reactions ──
    let commentReactionCount = 0;
    for (const commentId of commentIds) {
      const reactors = new Set<number>();
      const numReactors = Math.floor(rand() * 3) + 1;
      for (let r = 0; r < numReactors; r++) {
        reactors.add(Math.floor(rand() * DEMO_USERS.length));
      }
      for (const reactorIdx of reactors) {
        const { error } = await admin.from("comment_reactions").insert({
          comment_id: commentId,
          user_id: userIds[reactorIdx],
          reaction_type: pick(["like", "love", "haha"]),
        });
        if (!error) commentReactionCount++;
      }
    }
    results.push(`${commentReactionCount} comment reactions added`);

    // ── Step 8: Create friendships ──
    // Make a social graph: each user is friends with ~2 others
    const friendshipPairs: Array<[number, number]> = [
      [0, 1], // Alex & Sarah
      [0, 2], // Alex & Jordan
      [1, 3], // Sarah & Maya
      [1, 4], // Sarah & Taylor
      [2, 3], // Jordan & Maya
      [2, 4], // Jordan & Taylor
    ];

    let friendCount = 0;
    for (const [a, b] of friendshipPairs) {
      const [pA, pB] = [userIds[a], userIds[b]].sort();
      const { error } = await admin.from("friendships").upsert(
        {
          requester_id: pA,
          receiver_id: pB,
          status: "accepted",
        },
        { onConflict: "requester_id, receiver_id" },
      );
      if (!error) friendCount++;
    }
    results.push(`${friendCount} friendships created`);

    // ── Step 9: Create conversations & messages ──
    const chatPairs: Array<[number, number, Array<[number, string]>]> = [
      [0, 1, [
        [1, "Hey Alex! Love your hiking photos! Which trail was that?"],
        [0, "Thanks Sarah! It was the Cascade Mountain trail. You'd love it!"],
        [1, "I've been wanting to get into hiking more. Any beginner tips?"],
        [0, "Start with easy trails and invest in good boots! I can recommend some."],
        [1, "That would be amazing! Let me know next time you go."],
      ]],
      [0, 2, [
        [2, "Alex! Your ramen post inspired me. I made some last night!"],
        [0, "Nice! How did it turn out? Share a pic!"],
        [2, "It was decent for a first attempt! Definitely need more practice."],
      ]],
      [1, 3, [
        [3, "Hey Sarah! Saw you're a dev too — what stack do you work with?"],
        [1, "Hey Maya! Mostly React/TypeScript. You?"],
        [3, "I do full-stack with Next.js! We should pair program sometime."],
        [1, "That sounds fun! Let's do it!"],
      ]],
      [2, 4, [
        [4, "Jordan! Your art is incredible. Do you take commissions?"],
        [2, "Thank you Taylor! I do — DM me what you're looking for!"],
      ]],
    ];

    let convCount = 0;
    let msgCount = 0;

    for (const [userA, userB, messages] of chatPairs) {
      const [pA, pB] = [userIds[userA], userIds[userB]].sort();
      const { data: conv, error: convErr } = await admin
        .from("conversations")
        .insert({ participant_a_id: pA, participant_b_id: pB })
        .select("id")
        .single();

      if (convErr) {
        console.error(`Conversation create warning: ${convErr.message}`);
        continue;
      }

      convCount++;
      const baseTime = Date.now() - 3 * 24 * 60 * 60 * 1000;

      for (let m = 0; m < messages.length; m++) {
        const [senderIdx, content] = messages[m];
        const createdAt = new Date(baseTime + m * 3600000).toISOString();
        const { error: msgErr } = await admin.from("messages").insert({
          conversation_id: conv.id,
          sender_id: userIds[senderIdx],
          content,
          created_at: createdAt,
        });
        if (!msgErr) msgCount++;
      }

      // Update last_message_at
      const lastMsgTime = new Date(baseTime + (messages.length - 1) * 3600000).toISOString();
      await admin.from("conversations").update({ last_message_at: lastMsgTime }).eq("id", conv.id);
    }
    results.push(`${convCount} conversations, ${msgCount} messages created`);

    // ── Step 10: Create notifications ──
    const notifData: Array<{
      recipient_idx: number;
      actor_idx: number;
      kind: string;
      entity_type: string;
      data: Record<string, unknown>;
    }> = [
      { recipient_idx: 0, actor_idx: 1, kind: "friend_request", entity_type: "friendship", data: { requester_id: userIds[1] } },
      { recipient_idx: 0, actor_idx: 1, kind: "message", entity_type: "message", data: { conversation_id: "seed" } },
      { recipient_idx: 2, actor_idx: 3, kind: "friend_request", entity_type: "friendship", data: { requester_id: userIds[3] } },
      { recipient_idx: 4, actor_idx: 0, kind: "friend_request_accepted", entity_type: "friendship", data: { friendship_id: "seed" } },
    ];

    let notifCount = 0;
    for (const n of notifData) {
      const { error } = await admin.from("notifications").insert({
        recipient_id: userIds[n.recipient_idx],
        actor_id: userIds[n.actor_idx],
        kind: n.kind,
        entity_type: n.entity_type,
        data: n.data,
      });
      if (!error) notifCount++;
    }
    results.push(`${notifCount} notifications created`);

    return Response.json({
      success: true,
      message: "✅ Demo data seeded successfully!",
      details: results,
      users: DEMO_USERS.map((u, i) => ({
        email: u.email,
        password: "DemoPass123!",
        display_name: u.display_name,
      })),
      note: "You can now sign in with any of the demo accounts above.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Clean up on failure — delete created auth users
    for (const uid of userIds) {
      await admin.auth.admin.deleteUser(uid).catch(() => {});
    }
    return Response.json({ success: false, error: message, partial: results }, { status: 500 });
  }
}
