import {join} from "path";
import {eq} from "drizzle-orm";
import {readFileSync} from "node:fs";
import {db} from "~/lib/server/database/db";
import {createServerOnlyFn} from "@tanstack/react-start";
import {label as labelTable} from "~/lib/server/database/schema";


export const seedLabels = createServerOnlyFn(() => async () => {
    const labelsFilePath = join(import.meta.dirname, "../server/assets/labels.json");

    const fileContent = readFileSync(labelsFilePath, "utf-8");
    const jsonLabels: { name: string; color: string; order: number }[] = JSON.parse(fileContent);

    for (const label of jsonLabels) {
        const existingLabel = db
            .select()
            .from(labelTable)
            .where(eq(labelTable.name, label.name))
            .get();

        if (existingLabel) {
            await db
                .update(labelTable)
                .set({
                    color: label.color,
                    order: label.order,
                }).where(eq(labelTable.name, label.name));
        }
        else {
            await db
                .insert(labelTable)
                .values({
                    name: label.name,
                    color: label.color,
                    order: label.order,
                });
        }
    }
})();
