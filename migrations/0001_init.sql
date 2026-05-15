CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `avatar` text,
  `role` text NOT NULL DEFAULT 'member' CHECK(`role` IN ('member', 'admin')),
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `albums` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `cover_url` text,
  `created_by` text NOT NULL REFERENCES `users`(`id`),
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `posts` (
  `id` text PRIMARY KEY NOT NULL,
  `description` text,
  `album_id` text NOT NULL REFERENCES `albums`(`id`) ON DELETE CASCADE,
  `created_by` text NOT NULL REFERENCES `users`(`id`),
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `post_photos` (
  `id` text PRIMARY KEY NOT NULL,
  `post_id` text NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE,
  `url` text NOT NULL,
  `order_index` integer NOT NULL DEFAULT 0
);
