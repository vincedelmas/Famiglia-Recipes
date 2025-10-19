/// <reference types="vite/client"/>
import appCss from "~/styles.css?url";
import {addSeo} from "~/lib/utils/seo";
import {I18nextProvider} from "react-i18next";
import i18nInstance from "~/lib/client/i18n/i18n";
import {authOptions} from "~/lib/client/react-query";
import {type QueryClient} from "@tanstack/react-query";
import {Toaster} from "~/lib/client/components/ui/sonner";
import {Navbar} from "~/lib/client/components/app/Navbar";
import {Footer} from "~/lib/client/components/app/Footer";
import {TanStackDevtools} from "@tanstack/react-devtools";
import {useNProgress} from "~/lib/client/hooks/use-nprogress";
import {ReactQueryDevtoolsPanel} from "@tanstack/react-query-devtools";
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools";
import {createRootRouteWithContext, HeadContent, Outlet, Scripts} from "@tanstack/react-router";
import {ReactNode, useEffect, useState} from "react";


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    ssr: false,
    beforeLoad: async ({ context: { queryClient } }) => queryClient.prefetchQuery(authOptions),
    head: () => ({
        meta: [
            { charSet: "UTF-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            ...addSeo({
                image: "logo512.png",
                title: "Famiglia-Recipes",
                description: `A simple, modern web app designed for families to easily share and manage recipes.`,
            }),
        ],
        links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: RootComponent,
    shellComponent: RootComponent,
});


function RootComponent() {
    useNProgress();
    const [devTools, setDevtools] = useState<null | ReactNode>(null);

    useEffect(() => {
        if (import.meta.env.DEV) {
            Promise.all([
                import("@tanstack/react-devtools").then((m) => m.TanStackDevtools),
                import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtoolsPanel),
                import("@tanstack/react-router-devtools").then((m) => m.TanStackRouterDevtoolsPanel),
            ]).then(([TanStackDevtools, ReactQueryDevtoolsPanel, TanStackRouterDevtoolsPanel]) => {
                setDevtools(
                    <TanStackDevtools
                        eventBusConfig={{ debug: false, connectToServerBus: true }}
                        plugins={[
                            { name: "TanStack Query", render: <ReactQueryDevtoolsPanel/> },
                            { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel/> },
                        ]}
                    />
                );
            });
        }
    }, []);

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
        <head>
            <HeadContent/>
        </head>
        <body>

        <div id="root">
            <div className="flex flex-col min-h-[calc(100vh_-_64px)] mt-[64px]">
                <I18nextProvider i18n={i18nInstance}>
                    <Toaster/>
                    <Navbar/>
                    <main className="flex-1 w-[100%] max-w-[1320px] px-2 mx-auto">
                        <Outlet/>
                    </main>
                    <Footer/>
                </I18nextProvider>
            </div>
        </div>
        
        {devTools}
        <Scripts/>
        </body>
        </html>
    );
}
