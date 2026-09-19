import path from "path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import {defineConfig, withFilter} from "vite";
import {vite as gtCompiler} from "@generaltranslation/compiler";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import viteReact, {reactCompilerPreset} from "@vitejs/plugin-react";


export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            "~": path.resolve(import.meta.dirname, "./src"),
        },
    },
    plugins: [
        tanstackStart({
            prerender: {
                failOnError: false,
                retryCount: 3,
                retryDelay: 500,
            },
            spa: {
                enabled: true,
            },
            router: {
                semicolons: true,
                quoteStyle: "double",
                codeSplittingOptions: {
                    defaultBehavior: [
                        [
                            "component",
                            "pendingComponent",
                            "errorComponent",
                            "notFoundComponent",
                            "loader",
                        ],
                    ],
                },
            },
        }),
        viteReact(),
        ...[gtCompiler()].flat().map(plugin => {
            const transform = typeof plugin.transform === "function"
                ? plugin.transform
                : plugin.transform!.handler;

            return withFilter({
                ...plugin,
                transform(code, id, options) {
                    return transform.call(this, code, id.split("?")[0], options);
                },
            }, {
                transform: {
                    id: /\/src\/(routes\/|lib\/client\/components\/(app|details|recipe-form|ui)\/)/,
                },
            });
        }),
        // Extract translation hashes before React Compiler hoists JSX into cached variables.
        babel({ presets: [reactCompilerPreset()] }).then(plugin => ({ ...plugin, enforce: "post" as const })),
        tailwindcss(),
    ],
});
