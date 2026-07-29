# UI Redesign Plan — Facebook × Twitter × Telegram Hybrid

> **Goal:** Transform all pages and components into a modern, polished UI that
> feels like a mature 10-year-old platform — clean, fast, intentional.
> Inspired by Facebook (layout/navigation), Twitter (feed/timeline),
> and Telegram (messaging/simplicity).
>
> **All existing functionality must be preserved.** No feature removal.
>
> **When to start:** After your sleep. This doc is your reference.

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Global Layout & Navigation](#2-global-layout--navigation)
3. [Home Page (`/`)](#3-home-page)
4. [Auth Pages (`/login`, `/signup`)](#4-auth-pages)
5. [Onboarding (`/onboarding`)](#5-onboarding)
6. [Feed (`/feed`)](#6-feed)
7. [Post Detail (`/post/[postId]`)](#7-post-detail)
8. [Profiles (`/profiles/[userId]`, `/account`)](#8-profiles)
9. [Discover (`/discover`)](#9-discover)
10. [Messages (`/messages`)](#10-messages)
11. [Notifications (`/notifications`)](#11-notifications)
12. [Error / 404 Pages](#12-error--404-pages)
13. [FAVICON & Meta](#13-favicon--meta)
14. [Implementation Order](#14-implementation-order)

---

## 1. Design System

### Color Palette

```
Primary:     #2563EB (blue-600)     — buttons, links, active states
Primary dark: #1D4ED8 (blue-700)
Secondary:   #8B5CF6 (violet-500)   — accents, badges, highlights

Bg:          #FFFFFF or #F8FAFC     — light surface
Bg card:     #FFFFFF                — card surfaces
Bg hover:    #F1F5F9 (slate-100)    — hover states
Bg dark:     #0F172A (slate-900)    — dark background
Bg card dark: #1E293B (slate-800)
Bg hover dark: #334155 (slate-700)

Text:        #0F172A (slate-900)    — primary text
Text soft:   #64748B (slate-500)    — secondary/muted
Text dark:   #F1F5F9 (slate-100)
Text soft dark: #94A3B8 (slate-400)

Border:      #E2E8F0 (slate-200)    — cards, dividers
Border dark: #334155 (slate-700)

Danger:      #EF4444 (red-500)      — delete, block
Success:     #22C55E (green-500)    — accepted, online
Warning:     #F59E0B (amber-500)    — pending
```

### Typography

```
Font: Inter (Google Font) — replaces Geist
(Install: npm install @fontsource/inter)

H1:       text-2xl font-bold        — page titles
H2:       text-lg font-semibold     — section headers
Body:     text-sm                   — standard text
Small:    text-xs text-soft         — timestamps, metadata
```

### Spacing & Layout

```
Page max width:   1280px (max-w-7xl)
Sidebar width:    280px (left nav) / 320px (right panel)
Content center:   680px (feed/post)
Card rounding:    rounded-xl (12px) — large surfaces
                   rounded-lg (8px)  — small cards
                   rounded-full      — avatars, badges
Shadow:           shadow-sm hover:shadow-md transition
```

### Icons

Use **Lucide React** (same family Telegram/Facebook use):
```bash
npm install lucide-react
```

### Key Component Patterns

| Component | Inspiration | Pattern |
|-----------|-------------|---------|
| Navbar | Twitter | Fixed top bar with logo + search + icons |
| Left sidebar | Facebook | Sticky nav with user pill, links, shortcuts |
| Feed cards | Twitter | Card + avatar + content + actions row |
| Chat bubbles | Telegram | Right-aligned (mine) / Left-aligned (theirs) |
| Profile header | Facebook | Cover photo + avatar + tabs |
| Buttons | Twitter | Pill-shaped, icon+text |

---

## 2. Global Layout & Navigation

### Current State
- Simple `<html>` with Geist font, no nav, no shared layout between pages
- Each page is a standalone centered `<main>` tag

### Target State

**Files to modify:**
- `web/src/app/layout.tsx` — root layout with fonts, providers
- `web/src/app/globals.css` — design tokens, scrollbar styles, utilities

**New files to create:**
- `web/src/components/layout/Navbar.tsx` — top navigation bar
- `web/src/components/layout/Sidebar.tsx` — left sidebar nav
- `web/src/components/layout/RightPanel.tsx` — right sidebar (trending/suggestions)
- `web/src/components/layout/AuthLayout.tsx` — centered layout for login/signup
- `web/src/components/layout/AppLayout.tsx` — authenticated layout (navbar + sidebar + content)
- `web/src/components/ui/Avatar.tsx` — reusable avatar component
- `web/src/components/ui/Button.tsx` — reusable button with variants
- `web/src/components/ui/Card.tsx` — reusable card wrapper
- `web/src/components/ui/Tabs.tsx` — tab navigation
- `web/src/components/ui/Modal.tsx` — reusable modal/dialog
- `web/src/components/ui/Badge.tsx` — notification badges
- `web/src/components/ui/Skeleton.tsx` — loading skeletons
- `web/src/components/ui/EmptyState.tsx` — empty state illustrations

### Layout Structure

```
Authenticated pages (/feed, /discover, /messages, etc.):
┌─────────────────────────────────────────────────┐
│  NAVBAR (fixed top)                             │
│  Logo | Search | [Notifications] [Messages] [A] │
├──────────┬──────────────────┬───────────────────┤
│ SIDEBAR  │  MAIN CONTENT    │  RIGHT PANEL      │
│ (280px)  │  (flex-1)        │  (320px)          │
│          │                  │                   │
│ Home     │  Page content    │ Trending topics   │
│ Feed     │  max-w-680px     │ Friend suggestions│
│ Discover │  centered        │ Today's birthdays │
│ Messages │                  │                   │
│ Notifs   │                  │                   │
├──────────┴──────────────────┴───────────────────┤
│  FOOTER (minimal, only copyright)               │
└─────────────────────────────────────────────────┘

Auth pages (/login, /signup):
┌──────────────────────────────────┐
│  Minimal centered card on        │
│  gradient/splash background      │
│                                  │
│  ┌────────────────────────┐      │
│  │    Logo + Tagline      │      │
│  │    [Form]              │      │
│  │    [Submit]            │      │
│  │    "Already have an    │      │
│  │     account?" link     │      │
│  └────────────────────────┘      │
└──────────────────────────────────┘
```

### Navbar Details (Twitter-style)

```tsx
// Sticky top, glass-morphism effect (backdrop-blur)
// Left: Logo (ViCo wordmark + icon)
// Center: Search input (collapses to icon on mobile)
// Right: Icons — Bell (with badge), Envelope, Avatar dropdown
// The avatar dropdown: "Your Profile" | "Account" | "Sign out"
```

### Sidebar Details (Facebook-style)

```tsx
// Sticky, scrollable
// Top: User pill (avatar + name + "View profile")
// Links with active indicator:
//   🏠 Home        → /
//   📰 Feed        → /feed
//   🔍 Discover    → /discover
//   💬 Messages    → /messages (with unread badge)
//   🔔 Notifications → /notifications
// Bottom: "Sign out" link
```

### Right Panel Details

```tsx
// Sticky, hidden on mobile screens
// Sections (each collapsible):
// 1. "Suggested for you" — 3-4 people cards with "Follow" button
// 2. "Trending interests" — hashtag-style interest tags
// 3. Footer links
```

---

## 3. Home Page (`/`)

**File:** `web/src/app/page.tsx`

### Current Design
- Centered text: "Make friends around the world"
- Two CTA buttons for signed-out users
- A link to `/account` for signed-in users

### Target Design
```
SIGNED OUT:
┌──────────────────────────────────────────────────────┐
│                                                      │
│    ┌──────────────────────────────────────┐          │
│    │          🎉  ViCo  🎉               │          │
│    │   Make friends around the world      │          │
│    │                                      │          │
│    │   [Get Started]  [I have an account] │          │
│    │                                      │          │
│    │   "Meet people who share...          │          │
│    │    your interests — not a            │          │
│    │    follower count."                  │          │
│    └──────────────────────────────────────┘          │
│                                                      │
│    [Feature cards below]                             │
│    ┌──────┐ ┌──────┐ ┌──────┐                       │
│    │Match │ │Chat  │ │Safe  │                       │
│    │by    │ │with  │ │&     │                       │
│    │inter.│ │friends│ │kind  │                       │
│    └──────┘ └──────┘ └──────┘                       │
│                                                      │
└──────────────────────────────────────────────────────┘

SIGNED IN:
 Redirect to /feed — don't show the landing page at all.
```

**Changes:**
- Bigger hero section with gradient background
- Three feature highlight cards below (Interest matching, Real-time chat, Safe community)
- Signed-in users redirect to `/feed`

---

## 4. Auth Pages (`/login`, `/signup`)

**Files:** `web/src/app/login/page.tsx`, `LoginForm.tsx`, `signup/page.tsx`, `SignupForm.tsx`

### Current Design
- Centered `<main>` tag
- Plain form inputs with Tailwind borders
- Simple text links

### Target Design

```
┌───────────────────────────────────────────┐
│                                           │
│  ┌───────────────────────────────┐        │
│  │     🎉  ViCo                  │        │
│  │  Make friends around          │        │
│  │  the world                    │        │
│  │                               │        │
│  │  ┌─────────────────────┐      │        │
│  │  │ Email               │      │        │
│  │  └─────────────────────┘      │        │
│  │  ┌─────────────────────┐      │        │
│  │  │ Password             │      │        │
│  │  └─────────────────────┘      │        │
│  │                               │        │
│  │  [Sign in]                    │        │
│  │                               │        │
│  │  ────── or ──────             │        │
│  │                               │        │
│  │  [Continue with Google]       │        │
│  │                               │        │
│  │  New here? Create an account  │        │
│  └───────────────────────────────┘        │
│                                           │
└───────────────────────────────────────────┘
```

**Changes:**
- Splash background (subtle gradient)
- Card on white with soft shadow
- Logo + tagline centered above form
- Inputs: cleaner focus rings, left labels
- Error messages: inline below inputs (preserve current validation)
- Google button shows Google logo icon

---

## 5. Onboarding (`/onboarding`)

**Files:** `web/src/app/onboarding/page.tsx`, `OnboardingForm.tsx`

### Current Design
- Single page with display name, bio, interest checkboxes
- Interests listed as a grid of checkboxes

### Target Design

**Multi-step wizard** (3 steps, like Telegram's clean setup):

```
Step 1/3: Profile
┌────────────────────────┐
│  👤 Upload avatar       │
│  Display name: [_____]  │
│  Bio: [textarea]        │
│  [Next →]               │
└────────────────────────┘

Step 2/3: Your interests
┌────────────────────────┐
│ "What do you like?"    │
│                        │
│ Creative     [Photography] [Drawing] [Writing]
│ Outdoors     [Hiking] [Running] [Cycling]
│ Food & Drink [Cooking] [Baking] [Coffee]
│ ...                    │
│ (as pill buttons,      │
│  toggle selected style)│
│                        │
│ [← Back]    [Next →]   │
└────────────────────────┘

Step 3/3: Done!
┌────────────────────────┐
│  ✅ All set!            │
│                        │
│  We'll match you with  │
│  people who share your │
│  interests.            │
│                        │
│  [Go to Feed 🎉]       │
└────────────────────────┘
```

**Changes:**
- Stepper UI at top (dots: ● ● ●)
- Step 1: Avatar upload (placeholder for now), display name, bio
- Step 2: Interest pills instead of checkboxes (selected = filled primary color)
- Step 3: Confirmation with confetti/celebration
- Progress bar at top

---

## 6. Feed (`/feed`)

**Files:** `web/src/app/feed/page.tsx`, `PostComposer.tsx`, `PostItem.tsx`

### Current Design
- Simple list of post cards with reactions row at bottom
- Textarea composer
- Basic reaction emoji buttons

### Target Design (Twitter × Facebook hybrid)

```
┌────────────────────────────────────┐
│ Feed                               │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ 📝 What's on your mind?     │   │
│ │ (textarea)                   │   │
│ │                    [Post] 🟦 │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ 🧑 Avatar    Alex Morgan     │   │
│ │              2h ago          │   │
│ │──────────────────────────────│   │
│ │ Post content here...         │   │
│ │ Lorem ipsum dolor sit amet   │   │
│ │                              │   │
│ │ ──────────────────────────── │   │
│ │ 👍 5  ❤️ 3  😂 1  😮 0  😢 0 │   │
│ │ [Like] [Love] [Haha] [Wow] │   │
│ │                              │   │
│ │ 💬 3 comments                │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

**Changes:**
- **Composer**: Facebook-style with avatar + "What's on your mind?" placeholder. Expandable on focus.
- **Post cards**: Twitter-style layout — avatar row, content, media area (future), action bar
- **Action bar**: Like, Comment, Share — each with icon + count, styled like Twitter
- **Reactions**: Show top 3 emoji counts inline (Facebook style), click to expand
- **Comments**: Click expands inline comments below the post (Twitter style)
- **Empty state**: Illustration + "No posts yet. Be the first!"

---

## 7. Post Detail (`/post/[postId]`)

**Files:** `web/src/app/post/[postId]/page.tsx`, `CommentForm.tsx`, `CommentItem.tsx`

### Current Design
- Post card followed by comment form then comment list
- Basic layout

### Target Design (Twitter detail view)

```
┌─────────────────────────────────────┐
│ ← Back to feed                      │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 🧑 Avatar    Alex Morgan      │   │
│ │              @alex · 2h ago   │   │
│ │───────────────────────────────│   │
│ │ Post content...               │   │
│ │                               │   │
│ │ ───────────────────────────── │   │
│ │ 👍 5  ❤️ 3  💬 2             │   │
│ │                               │   │
│ │ [💬 Comment] [🔁 Share]       │   │
│ └───────────────────────────────┘   │
│                                     │
│ ──── Comments ────                  │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 🧑 Avatar    Write a comment… │   │
│ │ (expands on focus)  [Post]    │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 🧑 Avatar  Jamie   1h ago     │   │
│ │ Great post!                   │   │
│ │                    [❤️]       │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ 🧑 Avatar  Sam     30m ago    │   │
│ │ Agreed!                       │   │
│ │                    [❤️]       │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Changes:**
- Twitter-style detail view
- Comment composer expands on focus (Telegram-style)
- Each comment has reply indicator and reaction
- Smooth scroll to comments
- Better date formatting ("2h ago", "Yesterday")

---

## 8. Profiles (`/profiles/[userId]`, `/account`)

**Files:**
- `profiles/[userId]/page.tsx`, `ProfileViewHeader.tsx`, `FriendActionButtons.tsx`, `ReportButton.tsx`
- `account/page.tsx`, `FriendRequestInbox.tsx`

### Current Design
- Simple avatar + name + interests
- Row of action buttons (friend request, block, mute, report)
- Account page is a list of links

### Target Design (Facebook × Twitter hybrid)

```
COVER PHOTO ───────────────────────────────────
│                                             │
│           🧑 Avatar (large)                 │
│           Alex Morgan                       │
│           21-25 · New York                  │
│                                             │
│           "Bio text here..."                │
│                                             │
│           ✓ 12 mutual interests             │
│                                             │
│  ┌──────┐ ┌──────┐ ┌─────┐ ┌──────┐       │
│  │Friend│ │Message│ │Block│ │Report│       │
│  │Request│ │       │ │     │ │  ▼   │       │
│  └──────┘ └──────┘ └─────┘ └──────┘       │
└─────────────────────────────────────────────┘

[Tabs: Posts | About | Friends]

Posts tab:
─── Alex's posts ───
(Post cards same as feed)

About tab:
─── Interests ───
[Photography] [Hiking] [Coding] ...

─── Bio ───
Full bio text here

Friends tab:
─── Friends (12) ───
[Avatar + Name] [Avatar + Name] [Avatar + Name] ...
```

### Account Page (Facebook settings style)

```
┌──────────────────────────────────────┐
│ ⚙️ Account Settings                  │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 📋 Your Info                   │   │
│ │ Display name: Alex             │   │
│ │ Email: alex@email.com          │   │
│ │ Bio: ...                       │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 👥 Friend Requests (3)         │   │
│ │ [Accept/Decline per request]   │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 🔒 Privacy                     │   │
│ │ Blocked users: [Manage]        │   │
│ │ Muted users: [Manage]          │   │
│ └────────────────────────────────┘   │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ 📱 Navigation                  │   │
│ │ [Feed] [Discover] [Messages]   │   │
│ └────────────────────────────────┘   │
│                                      │
│ [Sign out 🔴]                        │
└──────────────────────────────────────┘
```

**Changes:**
- **Cover photo**: Gradient banner as placeholder (actual upload = Phase 5)
- **Avatar**: Large, centered below cover
- **Tabs**: Posts | About | Friends — Facebook-style tab bar
- **Action buttons**: Redesigned as rounded pills with icons
- **Friend request inbox**: Clean rows with avatar + name + Accept/Decline
- **Report button**: Moves to a dropdown "..." menu (Twitter-style)
- **Account page**: Reimagined as settings panel with sections

---

## 9. Discover (`/discover`)

**Files:** `web/src/app/discover/page.tsx`, `DiscoverCard.tsx`

### Current Design
- List of cards with match percentage, interests, friend request button

### Target Design (Facebook-style suggestions + Tinder-style cards)

```
┌─────────────────────────────────────┐
│ 🔍 Discover                         │
│ People who share your interests     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Filters: Age | Location | All] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🧑 Avatar  Sarah               │ │
│ │            21-25 · 85% match   │ │
│ │────────────────────────────────│ │
│ │ "Love hiking and photography"  │ │
│ │                                │ │
│ │ [Hiking] [Photography] [Coding]│ │
│ │                                │ │
│ │ [Send Friend Request]          │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🧑 Avatar  Jordan              │ │
│ │            26-30 · 72% match   │ │
│ │ ...                             │ │
│ └────────────────────────────────┘ │
│                                     │
│ [Show more]                          │
└─────────────────────────────────────┘
```

**Changes:**
- **Filter bar**: Pill-shaped filter buttons (All, By age, By location — future)
- **Cards**: Facebook-style with larger avatar, match badge (green %)
- **Interest pills**: Smaller, inline with label
- **Friend request button**: Primary blue, disabled state for "Request sent"
- **Loading state**: Skeleton cards while fetching
- **Empty state**: "No matches yet — add more interests!"

---

## 10. Messages (`/messages`)

**Files:**
- `messages/page.tsx`
- `messages/[conversationId]/page.tsx`
- `ConversationThread.tsx`, `MessageComposer.tsx`
- `OpenConversationForm.tsx`

### Current Design
- Separate page listing conversations, clicking opens another page
- Basic chat bubbles, simple Realtime subscription

### Target Design (Telegram-inspired)

**Split-pane layout** (Telegram desktop style):

```
┌─────────────────────────────────────────────┐
│ Messages                                     │
│                                              │
│ ┌───────────────────┬─────────────────────┐  │
│ │ CONVERSATION LIST │ CHAT VIEW           │  │
│ │ (320px)           │                     │  │
│ │                    │                     │  │
│ │ 🔍 Search chats   │ 🧑 Alex Morgan      │  │
│ │                    │                     │  │
│ │ ┌──────────────┐  │ ┌─────────────────┐ │  │
│ │ │🧑 Alex      │  │ │ Hey! How are you?│ │  │
│ │ │"Hey! How..." │  │ │                 │ │  │
│ │ │🟢 2m ago    │  │ │ ┌──────────┐    │ │  │
│ │ └──────────────┘  │ │ │I'm good! │    │ │  │
│ │                    │ │ │you?      │    │ │  │
│ │ ┌──────────────┐  │ │ └──────────┘    │ │  │
│ │ │🧑 Sarah      │  │ │                 │ │  │
│ │ │"See you..."  │  │ │ ┌──────────┐    │ │  │
│ │ │   1h ago     │  │ │ │Let's meet│    │ │  │
│ │ └──────────────┘  │ │ │tomorrow  │    │ │  │
│ │                    │ │ └──────────┘    │ │  │
│ │ ┌──────────────┐  │ │                 │ │  │
│ │ │🧑 Jamie      │  │ │ [Type a msg...] │ │  │
│ │ │"Thanks!"     │  │ │ [Send ▶️]       │ │  │
│ │ │   yesterday  │  │ └─────────────────┘ │  │
│ │ └──────────────┘  │                     │  │
│ └───────────────────┴─────────────────────┘  │
└─────────────────────────────────────────────┘
```

**On mobile:** Split becomes full-screen pages with back navigation.

**Changes:**
- **Split pane**: Conversation list (left) + Chat view (right) — Telegram style
- **Conversation list**: Avatar + name + last message preview + time + online dot
- **Search**: Filter conversations by name
- **Chat bubbles**: Rounded rectangles (Telegram) — sent = primary blue, received = gray
- **Timestamps**: Inside bubbles (Telegram style)
- **Online indicator**: Green dot on active users
- **Composer**: Input expands, send button is a paper plane icon (Telegram)
- **Empty conversation**: "Select a conversation to start chatting"
- **No conversations yet**: "Find friends on Discover to start messaging!"
- **Realtime**: Keep existing Realtime subscription for live updates

---

## 11. Notifications (`/notifications`)

**Files:** `web/src/app/notifications/page.tsx`

### Current Design
- Simple list of links with kind label + actor name + date

### Target Design (Facebook × Twitter hybrid)

```
┌──────────────────────────────────────┐
│ 🔔 Notifications                     │
│                                      │
│ [Mark all read]                      │
│                                      │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│ │ ● New                            │   │
│ │                                  │   │
│ │ ┌────────────────────────────┐   │   │
│ │ │🧑 Alex sent you a message │   │   │
│ │ │  💬 "Hey! How are you?"   │   │   │
│ │ │  2m ago                    │   │   │
│ │ └────────────────────────────┘   │   │
│ │                                  │   │
│ │ ┌────────────────────────────┐   │   │
│ │ │🧑 Sarah sent you a        │   │   │
│ │ │   friend request           │   │   │
│ │ │   [Accept] [Decline]       │   │   │
│ │ │  1h ago                    │   │   │
│ │ └────────────────────────────┘   │   │
│ │                                  │   │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                      │
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│ │ ○ Earlier                       │   │
│ │ ┌────────────────────────────┐   │   │
│ │ │🧑 Jamie accepted your     │   │   │
│ │ │   friend request! 🎉       │   │   │
│ │ │  yesterday                 │   │   │
│ │ └────────────────────────────┘   │   │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
└──────────────────────────────────────┘
```

**Changes:**
- **Icon per type**: 💬 = message, 👥 = friend request, ✅ = accepted
- **Unread indicator**: Blue dot on left (Facebook), bold text
- **Sectioned**: "New" / "Earlier" (Facebook)
- **Inline actions**: Friend request notifications have Accept/Decline buttons
- **Timestamp**: Relative ("2m ago", "1h ago", "yesterday")
- **Empty state**: "No notifications yet. Connect with people to get started!"

---

## 12. Error / 404 Pages

**Files:** `web/src/app/error.tsx`, `not-found.tsx`, `auth/auth-code-error/page.tsx`

### Current Design
- Simple text + button

### Target Design

```
404:
┌──────────────────────────────────────┐
│                                      │
│           🤷‍♂️                        │
│      Page not found                  │
│                                      │
│   The link may be old, or the page   │
│   may have moved.                    │
│                                      │
│       [Go home 🏠]                   │
│                                      │
└──────────────────────────────────────┘

Error:
┌──────────────────────────────────────┐
│                                      │
│           😕                         │
│      Something went wrong            │
│                                      │
│   We hit an unexpected problem.      │
│   Please try again.                  │
│                                      │
│   Reference: req_abc123              │
│                                      │
│       [Try again ↩️]                 │
│                                      │
└──────────────────────────────────────┘
```

**Changes:**
- Emoji illustration
- Clean card layout
- Reference code in error page
- Subtle animation on buttons

---

## 13. FAVICON & Meta

- Replace `web/public/` SVG files with proper ViCo branding
- Create a simple favicon (V + chat bubble icon)
- Update Open Graph meta tags in `layout.tsx`

---

## 14. Implementation Order

This is the recommended order — each step is buildable and testable independently.

### Phase A — Foundation (do first)
| Step | What | Files |
|------|------|-------|
| A1 | Install deps: `lucide-react`, `@fontsource/inter` | `package.json` |
| A2 | Update `globals.css` with design tokens | `globals.css` |
| A3 | Create reusable UI components (Avatar, Button, Card, Badge, Skeleton, EmptyState, Modal) | New files |
| A4 | Update root `layout.tsx` with Inter font + providers | `layout.tsx` |
| A5 | Create `Navbar` component | New |
| A6 | Create `Sidebar` component | New |
| A7 | Create `AppLayout` component | New |
| A8 | Create `AuthLayout` component | New |
| A9 | Add "signed-in redirect to /feed" to home page | `page.tsx` |

### Phase B — Auth & Onboarding
| Step | What | Files |
|------|------|-------|
| B1 | Redesign Login page | `login/page.tsx`, `LoginForm.tsx` |
| B2 | Redesign Signup page | `signup/page.tsx`, `SignupForm.tsx` |
| B3 | Redesign Onboarding as multi-step wizard | `onboarding/*` |
| B4 | Redesign check-email page | `check-email/page.tsx` |

### Phase C — Feed & Posts
| Step | What | Files |
|------|------|-------|
| C1 | Redesign Feed page (layout + AppLayout) | `feed/page.tsx` |
| C2 | Redesign PostComposer | `PostComposer.tsx` |
| C3 | Redesign PostItem (Twitter layout + actions) | `PostItem.tsx` |
| C4 | Redesign Post detail page | `post/[postId]/page.tsx` |
| C5 | Redesign CommentForm + CommentItem | `CommentForm.tsx`, `CommentItem.tsx` |

### Phase D — Profiles & Discover
| Step | What | Files |
|------|------|-------|
| D1 | Redesign ProfileViewHeader (cover + avatar + tabs) | `ProfileViewHeader.tsx` |
| D2 | Redesign FriendActionButtons | `FriendActionButtons.tsx` |
| D3 | Redesign ReportButton | `ReportButton.tsx` |
| D4 | Redesign Profile page | `profiles/[userId]/page.tsx` |
| D5 | Redesign Account page (settings style) | `account/page.tsx` |
| D6 | Redesign FriendRequestInbox | `FriendRequestInbox.tsx` |
| D7 | Redesign Discover page + DiscoverCard | `discover/*` |

### Phase E — Messages
| Step | What | Files |
|------|------|-------|
| E1 | Redesign Messages list page | `messages/page.tsx` |
| E2 | Redesign Conversation page (split pane) | `messages/[conversationId]/page.tsx` |
| E3 | Redesign ConversationThread | `ConversationThread.tsx` |
| E4 | Redesign MessageComposer | `MessageComposer.tsx` |
| E5 | Create RightPanel (suggestions sidebar) | New |

### Phase F — Notifications & Polish
| Step | What | Files |
|------|------|-------|
| F1 | Redesign Notifications page | `notifications/page.tsx` |
| F2 | Redesign Error + 404 pages | `error.tsx`, `not-found.tsx` |
| F3 | Redesign auth-code-error page | `auth-code-error/page.tsx` |
| F4 | Update favicon + meta tags | `public/`, `layout.tsx` |
| F5 | Final QA pass — check all pages, dark mode, mobile | All |

---

## File Summary

### Files to modify (17 files):
| File | Change |
|------|--------|
| `web/src/app/globals.css` | Design tokens, scrollbar, utilities |
| `web/src/app/layout.tsx` | Inter font, providers |
| `web/src/app/page.tsx` | Hero section + feature cards / redirect |
| `web/src/app/login/page.tsx` | New auth layout wrapper |
| `web/src/app/login/LoginForm.tsx` | Redesigned form |
| `web/src/app/signup/page.tsx` | New auth layout wrapper |
| `web/src/app/signup/SignupForm.tsx` | Redesigned form (with DOB) |
| `web/src/app/feed/page.tsx` | AppLayout wrapper |
| `web/src/app/feed/PostItem.tsx` | Twitter-style card |
| `web/src/app/feed/PostComposer.tsx` | Facebook-style composer |
| `web/src/app/onboarding/page.tsx` | Multi-step state |
| `web/src/app/onboarding/OnboardingForm.tsx` | Step wizard UI |
| `web/src/app/error.tsx` | Emoji + card layout |
| `web/src/app/not-found.tsx` | Emoji + card layout |
| `web/package.json` | Add lucide-react, @fontsource/inter |

### Files to create (15+ new files):
| File | Purpose |
|------|---------|
| `web/src/components/ui/Avatar.tsx` | Reusable avatar (image/fallback/size) |
| `web/src/components/ui/Button.tsx` | Button variants (primary, ghost, danger, icon) |
| `web/src/components/ui/Card.tsx` | Card wrapper with optional padding, hover |
| `web/src/components/ui/Badge.tsx` | Count badges for nav icons |
| `web/src/components/ui/Skeleton.tsx` | Loading skeleton shapes |
| `web/src/components/ui/EmptyState.tsx` | Icon + text + optional action |
| `web/src/components/ui/Tabs.tsx` | Tab bar component |
| `web/src/components/ui/Modal.tsx` | Dialog overlay |
| `web/src/components/layout/Navbar.tsx` | Top navigation bar |
| `web/src/components/layout/Sidebar.tsx` | Left sidebar navigation |
| `web/src/components/layout/RightPanel.tsx` | Right sidebar suggestions |
| `web/src/components/layout/AppLayout.tsx` | Authenticated layout wrapper |
| `web/src/components/layout/AuthLayout.tsx` | Auth pages layout wrapper |
| `web/src/components/layout/StepWizard.tsx` | Multi-step progress indicator |
| `web/src/lib/format.ts` | Date formatting ("2h ago"), relative time helpers |

---

## Verification

After each phase, verify:
1. `npm run build` — no TypeScript errors
2. `npm run lint` — no ESLint errors
3. All existing functionality still works (auth, posting, reactions, messaging, etc.)
4. Dark mode toggle works (future — prepare CSS variables now)
5. Responsive layout at 320px, 768px, 1024px, 1440px
6. No visual regressions on pages not modified in that phase

---

*End of plan. Start from Phase A when ready.*
