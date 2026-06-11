PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_favorites` (
	`user_id` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `recipe_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_favorites`("user_id", "recipe_id") SELECT "user_id", "recipe_id" FROM `favorites`;--> statement-breakpoint
DROP TABLE `favorites`;--> statement-breakpoint
ALTER TABLE `__new_favorites` RENAME TO `favorites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_recipe_label` (
	`recipe_id` integer NOT NULL,
	`label_id` integer NOT NULL,
	PRIMARY KEY(`recipe_id`, `label_id`),
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`label_id`) REFERENCES `label`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_recipe_label`("recipe_id", "label_id") SELECT "recipe_id", "label_id" FROM `recipe_label`;--> statement-breakpoint
DROP TABLE `recipe_label`;--> statement-breakpoint
ALTER TABLE `__new_recipe_label` RENAME TO `recipe_label`;--> statement-breakpoint
CREATE TABLE `__new_comment` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comment`("id", "user_id", "recipe_id", "content", "created_at", "updated_at") SELECT "id", "user_id", "recipe_id", "content", "created_at", "updated_at" FROM `comment`;--> statement-breakpoint
DROP TABLE `comment`;--> statement-breakpoint
ALTER TABLE `__new_comment` RENAME TO `comment`;--> statement-breakpoint
CREATE TABLE `__new_recipe` (
	`comment` text,
	`servings` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`title` text(255) NOT NULL,
	`prep_time` integer NOT NULL,
	`cooking_time` integer NOT NULL,
	`image` text DEFAULT 'default.png' NOT NULL,
	`steps` text NOT NULL,
	`submitter_id` integer NOT NULL,
	`submitted_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ingredients` text NOT NULL,
	FOREIGN KEY (`submitter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipe`("comment", "servings", "id", "title", "prep_time", "cooking_time", "image", "steps", "submitter_id", "submitted_date", "ingredients") SELECT "comment", "servings", "id", "title", "prep_time", "cooking_time", "image", "steps", "submitter_id", "submitted_date", "ingredients" FROM `recipe`;--> statement-breakpoint
DROP TABLE `recipe`;--> statement-breakpoint
ALTER TABLE `__new_recipe` RENAME TO `recipe`;--> statement-breakpoint
CREATE TABLE `__new_label` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`order` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_label`("id", "name", "color", "order") SELECT "id", "name", "color", "order" FROM `label`;--> statement-breakpoint
DROP TABLE `label`;--> statement-breakpoint
ALTER TABLE `__new_label` RENAME TO `label`;