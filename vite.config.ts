import path from "path";
import {defineConfig} from "vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import {tanstackStart} from "@tanstack/react-start/plugin/vite";
import viteReact, {reactCompilerPreset} from "@vitejs/plugin-react";


export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            "~": path.resolve(__dirname, "./src"),
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
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),
    ],
});
