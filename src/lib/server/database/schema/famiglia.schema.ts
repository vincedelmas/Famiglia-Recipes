import {sql} from "drizzle-orm";
import {relations} from "drizzle-orm/relations";
import {user} from "@/lib/server/database/schema/auth.schema";
import {customJson, imageUrl} from "@/lib/server/database/custom-types";
import {integer, primaryKey, sqliteTable, text} from "drizzle-orm/sqlite-core"


export const recipe = sqliteTable("recipe", {
    comment: text(),
    servings: integer().notNull(),
    id: integer().primaryKey().notNull(),
    title: text({ length: 255 }).notNull(),
    prepTime: integer("prep_time").notNull(),
    cookingTime: integer("cooking_time").notNull(),
    image: imageUrl("image").default("default.png").notNull(),
    steps: customJson<{ description: string }[]>("steps").notNull(),
    submitterId: integer("submitter_id").notNull().references(() => user.id),
    submittedDate: text("submitted_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
    ingredients: customJson<{ proportion: number, ingredient: string }[]>("ingredients").notNull(),
});


export const favorites = sqliteTable("favorites",
    {
        userId: integer("user_id").notNull().references(() => user.id),
        recipeId: integer("recipe_id").notNull().references(() => recipe.id, { onDelete: "cascade" }),
    },
    (table) => [primaryKey({ columns: [table.userId, table.recipeId], name: "favorites_user_id_recipe_id_pk" })]
);


export const recipeLabel = sqliteTable("recipe_label",
    {
        recipeId: integer("recipe_id").notNull().references(() => recipe.id, { onDelete: "cascade" }),
        labelId: integer("label_id").notNull().references(() => label.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.recipeId, table.labelId], name: "recipe_label_recipe_id_label_id_pk" })
    ]
);


export const label = sqliteTable("label", {
    id: integer().primaryKey().notNull(),
    name: text().notNull(),
    color: text().notNull(),
    order: integer().notNull(),
});


export const comment = sqliteTable("comment", {
    id: integer().primaryKey().notNull(),
    userId: integer("user_id").notNull().references(() => user.id),
    recipeId: integer("recipe_id").notNull().references(() => recipe.id, { onDelete: "cascade" }),
    content: text().notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: text("updated_at"),
});


export const userRelations = relations(user, ({ many }) => ({
    recipes: many(recipe),
    favorites: many(favorites),
    comments: many(comment),
}));


export const recipeRelations = relations(recipe, ({ one, many }) => ({
    submitter: one(user, {
        fields: [recipe.submitterId],
        references: [user.id]
    }),
    favorites: many(favorites),
    recipeLabels: many(recipeLabel),
    comments: many(comment),
}));


export const favoritesRelations = relations(favorites, ({ one }) => ({
    recipe: one(recipe, {
        fields: [favorites.recipeId],
        references: [recipe.id]
    }),
    user: one(user, {
        fields: [favorites.userId],
        references: [user.id]
    }),
}));


export const recipeLabelRelations = relations(recipeLabel, ({ one }) => ({
    label: one(label, {
        fields: [recipeLabel.labelId],
        references: [label.id]
    }),
    recipe: one(recipe, {
        fields: [recipeLabel.recipeId],
        references: [recipe.id]
    }),
}));


export const labelRelations = relations(label, ({ many }) => ({
    recipeLabels: many(recipeLabel),
}));


export const commentRelations = relations(comment, ({ one }) => ({
    recipe: one(recipe, {
        fields: [comment.recipeId],
        references: [recipe.id]
    }),
    user: one(user, {
        fields: [comment.userId],
        references: [user.id]
    }),
}));
