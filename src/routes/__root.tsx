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
import {useNProgress} from "~/lib/client/hooks/use-nprogress";
import {createRootRouteWithContext, HeadContent, Outlet, Scripts} from "@tanstack/react-router";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    ssr: false,
    beforeLoad: ({ context: { queryClient } }) => {
        return queryClient.ensureQueryData(authOptions);
    },
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

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
        <head>
            <HeadContent/>
        </head>
        <body>

        <div id="root">
            <div className="flex flex-col min-h-[calc(100vh-64px)] mt-16">
                <I18nextProvider i18n={i18nInstance}>
                    <Toaster/>
                    <Navbar/>
                    <main className="flex-1 w-full max-w-330 px-2 mx-auto">
                        <Outlet/>
                    </main>
                    <Footer/>
                </I18nextProvider>
            </div>
        </div>

        {import.meta.env.DEV &&
            <ReactQueryDevtools buttonPosition="bottom-left"/>
        }

        <Scripts/>
        </body>
        </html>
    );
}
