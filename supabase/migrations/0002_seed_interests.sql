-- 0002_seed_interests.sql — Phase 0 starter interest vocabulary.
--
-- A small, deliberately conservative list. The interest picker in Phase 1
-- will let users choose from these at onboarding (minimum 5, per spec).
-- We keep the list short so the matching engine has enough signal density
-- per tag; it grows over time as we learn which tags correlate with
-- successful friendships.
--
-- Categories are loose groupings. They are used purely for the picker's
-- visual layout; the matching algorithm does not weight by category.

insert into public.interests (slug, label, category) values
  -- creative
  ('photography',   'Photography',   'creative'),
  ('drawing',       'Drawing',       'creative'),
  ('writing',       'Writing',       'creative'),
  ('music-making',  'Making music',  'creative'),
  ('film-tv',       'Film & TV',     'creative'),
  -- active / outdoors
  ('hiking',        'Hiking',        'outdoors'),
  ('running',       'Running',       'outdoors'),
  ('cycling',       'Cycling',       'outdoors'),
  ('yoga',          'Yoga',          'outdoors'),
  ('climbing',      'Climbing',      'outdoors'),
  -- food & drink
  ('cooking',       'Cooking',       'food'),
  ('baking',        'Baking',        'food'),
  ('coffee',        'Coffee',        'food'),
  ('wine',          'Wine',          'food'),
  -- games & tech
  ('board-games',   'Board games',   'games'),
  ('video-games',   'Video games',   'games'),
  ('chess',         'Chess',         'games'),
  ('coding',        'Coding',        'tech'),
  ('ai-ml',         'AI / ML',       'tech'),
  -- learn & culture
  ('languages',     'Languages',     'learn'),
  ('history',       'History',       'learn'),
  ('science',       'Science',       'learn'),
  ('philosophy',    'Philosophy',    'learn'),
  -- lifestyle
  ('travel',        'Travel',        'lifestyle'),
  ('books',         'Books',         'lifestyle'),
  ('podcasts',      'Podcasts',      'lifestyle'),
  ('fitness',       'Fitness',       'lifestyle'),
  ('pets',          'Pets',          'lifestyle'),
  ('gardening',     'Gardening',     'lifestyle'),
  -- music taste
  ('jazz',          'Jazz',          'music'),
  ('rock',          'Rock',          'music'),
  ('hip-hop',       'Hip-hop',       'music'),
  ('classical',     'Classical',     'music'),
  ('electronic',    'Electronic',    'music'),
  -- sports
  ('soccer',        'Soccer',        'sports'),
  ('basketball',    'Basketball',    'sports'),
  ('tennis',        'Tennis',        'sports'),
  ('swimming',      'Swimming',      'sports'),
  ('martial-arts',  'Martial arts',  'sports')
on conflict (slug) do nothing;
