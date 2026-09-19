/// <reference types="vite/client"/>
import {useLocale} from "gt-react";
import type {ReactNode} from "react";
import appCss from "~/styles.css?url";
import {addSeo} from "~/lib/utils/seo";
import {authOptions} from "~/lib/client/react-query";
import {type QueryClient} from "@tanstack/react-query";
import {Toaster} from "~/lib/client/components/ui/toast";
import {Navbar} from "~/lib/client/components/app/Navbar";
import {Footer} from "~/lib/client/components/app/Footer";
import {useNProgress} from "~/lib/client/hooks/use-nprogress";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {TranslationProvider} from "~/lib/client/i18n/TranslationProvider";
import {ClientOnly, createRootRouteWithContext, HeadContent, Outlet, Scripts} from "@tanstack/react-router";


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    ssr: false,
    context: () => ({ authOptions }),
    beforeLoad: async ({ context: { queryClient, authOptions } }) => {
        return queryClient.query(authOptions);
    },
    head: () => ({
        meta: [
            { charSet: "UTF-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            ...addSeo({
                image: "logo512.png",
                title: "Famiglia-Recipes",
                description: `A private recipe collection for the family.`,
            }),
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "alternate icon", href: "/favicon.ico" },
            { rel: "apple-touch-icon", href: "/logo192.png" },
            { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        ],
    }),
    component: AppLayout,
    shellComponent: RootComponent,
});


function RootComponent({ children }: { children: ReactNode }) {
    return <TranslationProvider><RootDocument>{children}</RootDocument></TranslationProvider>;
}


function RootDocument({ children }: { children: ReactNode }) {
    const locale = useLocale();

    // noinspection HtmlUnknownAnchorTarget,HtmlRequiredTitleElement
    return (
        <html lang={locale} suppressHydrationWarning>
        <head>
            <HeadContent/>
        </head>
        <body>

        <ClientOnly>
            {children}
        </ClientOnly>

        {import.meta.env.DEV &&
            <ReactQueryDevtools
                buttonPosition="bottom-left"
            />
        }

        <Scripts/>
        </body>
        </html>
    );
}


function AppLayout() {
    useNProgress();

    return (
        <div id="root">
            <div className="flex min-h-dvh flex-col">
                <Toaster/>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
                >
                    Skip to content
                </a>
                <Navbar/>
                <main id="main-content" className="mx-auto w-full max-w-330 flex-1 px-5 pb-12 sm:px-8 lg:px-12">
                    <Outlet/>
                </main>
                <Footer/>
            </div>
        </div>
    );
}
