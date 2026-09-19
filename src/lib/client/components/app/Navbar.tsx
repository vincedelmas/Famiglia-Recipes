import {useState} from "react";
import {cn} from "~/lib/utils/helpers";
import {useTranslation} from "react-i18next";
import authClient from "~/lib/utils/auth-client";
import {getRouteApi, Link as NavLink, useLocation, useNavigate, useRouter} from "@tanstack/react-router";
import {useAuth} from "~/lib/client/hooks/use-auth";
import {useQueryClient} from "@tanstack/react-query";
import {Button} from "~/lib/client/components/ui/button";
import {Book, ChefHat, LogOut, Menu, Plus, X} from "lucide-react";
import {LanguageSwitcher} from "~/lib/client/components/app/LanguageSwitcher";


export const Navbar = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { pathname } = useLocation();
    const { authOptions } = getRouteApi("__root__").useRouteContext();
    const queryClient = useQueryClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: t("dashboard-nav"), to: "/dashboard", icon: ChefHat },
        { name: t("add-recipe-nav"), to: "/add-recipe", icon: Plus },
        { name: t("all-recipes-nav"), to: "/all-recipes", icon: Book },
    ];

    const logoutUser = async () => {
        await authClient.signOut();
        await router.invalidate();
        queryClient.setQueryData(authOptions.queryKey, null);
        await navigate({ to: "/", replace: true });
        queryClient.removeQueries();
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    if (!currentUser) {
        return (
            <nav className="w-screen z-50 flex items-center justify-center fixed top-0 h-16 bg-background border-b border-b-neutral-700">
                <div className="md:max-w-7xl flex w-full justify-between items-center container">
                    <NavLink to="/" className="flex items-center gap-3 text-lg font-semibold">
                        <img alt="Famiglia Recipes" src="/logo192.png" className="size-7"/>
                        Famiglia Recipes
                    </NavLink>
                    {pathname === "/" ?
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher/>
                        </div>
                        :
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher/>
                            <Button size="sm" nativeButton={false} render={<NavLink to="/"/>}>{t("login")}</Button>
                            <Button size="sm" variant="secondary" nativeButton={false} render={<NavLink to="/"/>}>{t("register")}</Button>
                        </div>
                    }
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-screen z-50 fixed top-0 border-b border-neutral-700 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <img alt="logo" src="/logo192.png" className="size-7"/>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-8 flex items-baseline space-x-4">
                                {navItems.map(item =>
                                    <NavLink key={item.name} to={item.to} className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium flex items-center", pathname === item.to ?
                                            "bg-gray-800" : "hover:bg-gray-700")}>
                                        <item.icon className="h-4 w-4 mr-2"/>
                                        {item.name}
                                    </NavLink>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <LanguageSwitcher className="mr-4"/>
                            <span className="text-gray-300 font-medium mr-4">{t("welcome-nav")} {currentUser.name}</span>
                            <Button variant="ghost" size="icon" onClick={logoutUser}>
                                <LogOut className="h-5 w-5"/>
                                <span className="sr-only">Logout</span>
                            </Button>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <X className="block h-6 w-6"/> : <Menu className="block h-6 w-6"/>}
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen &&
                <div className="md:hidden bg-neutral-950">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map(item =>
                            <NavLink key={item.name} to={item.to} className={cn(
                                "px-3 py-2 rounded-md text-base font-medium flex items-center", pathname === item.to ?
                                    "bg-gray-800" : "hover:bg-gray-700")} onClick={closeMobileMenu}>
                                <item.icon className="h-4 w-4 mr-2"/>
                                {item.name}
                            </NavLink>
                        )}
                    </div>
                    <div className="pt-2 pb-2 border-t border-gray-700">
                        <div className="flex items-center px-5">
                            <LanguageSwitcher/>
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none">
                                    {currentUser.name}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto" onClick={logoutUser}>
                                <LogOut className="h-5 w-5"/>
                                <span className="sr-only">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </nav>
    );
};
