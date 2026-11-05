import {useState} from "react";
import {useGT} from "gt-react";
import {cn} from "@/lib/utils/helpers";
import authClient from "@/lib/utils/auth-client";
import {useAuth} from "@/lib/client/hooks/use-auth";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "@/lib/client/components/ui/toast";
import {Button} from "@/lib/client/components/ui/button";
import {Avatar, AvatarFallback} from "@/lib/client/components/ui/avatar";
import {LanguageSwitcher} from "@/lib/client/components/app/LanguageSwitcher";
import {ArrowUpRight, BookOpen, Leaf, LogOut, Menu, Plus, Settings, X} from "lucide-react";
import {getRouteApi, Link, useLocation, useNavigate, useRouter} from "@tanstack/react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/lib/client/components/ui/dropdown-menu";


export const Navbar = () => {
    const gt = useGT();
    const router = useRouter();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { pathname } = useLocation();
    const queryClient = useQueryClient();
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const { authOptions } = getRouteApi("__root__").useRouteContext();

    const logoutUser = async () => {
        setSigningOut(true);

        try {
            const { error } = await authClient.signOut();
            if (error) {
                toast.add({ type: "error", title: gt("Couldn’t sign out. Please try again.") });
                return;
            }

            queryClient.setQueryData(authOptions.queryKey, null);
            setMenuOpen(false);

            await router.invalidate();
            await navigate({ to: "/", replace: true });
            queryClient.removeQueries();
        }
        catch {
            toast.add({ type: "error", title: gt("Couldn’t sign out. Please try again.") });
        }
        finally {
            setSigningOut(false);
        }
    };

    const navItems = [
        {
            icon: Leaf,
            to: "/dashboard",
            name: gt("Home"),
        },
        {
            icon: BookOpen,
            to: "/all-recipes",
            name: gt("The cookbook"),
        },
    ] as const;

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
            <nav aria-label={gt("Main navigation")} className="mx-auto flex h-20 max-w-330 items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">

                <Link to={currentUser ? "/dashboard" : "/"} className="flex shrink-0 items-center gap-2.5" aria-label="Famiglia">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Leaf className="size-4.75" strokeWidth={1.5}/>
                    </span>
                    <span className="font-heading text-[28px] tracking-[-0.06em]">
                        famiglia<span className="text-primary">.</span>
                    </span>
                </Link>

                {currentUser &&
                    <div className="hidden items-center gap-7 md:flex">
                        {navItems.map(item =>
                            <Link
                                to={item.to}
                                key={item.to}
                                aria-current={pathname === item.to ? "page" : undefined}
                                className={cn("flex h-20 items-center gap-2 border-b-2 text-sm transition-colors", pathname === item.to
                                    ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        )}
                    </div>
                }

                <div className="flex items-center gap-3 sm:gap-5">
                    {currentUser ?
                        <>
                            <Button className="hidden md:inline-flex" nativeButton={false} render={<Link to="/add-recipe"/>}>
                                <Plus data-icon="inline-start"/>
                                Add a recipe
                            </Button>
                            <div className="flex items-center gap-2 lg:border-l lg:pl-4">
                                <LanguageSwitcher/>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        aria-label={gt("Account menu")}
                                        render={<Button size="icon" variant="ghost" className="rounded-full"/>}
                                    >
                                        <Avatar>
                                            <AvatarFallback>
                                                {currentUser.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-48">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>
                                                {currentUser.name}
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                render={<Link to="/settings/connected-apps"/>}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <Settings/>
                                                Settings
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem disabled={signingOut} onClick={logoutUser}>
                                                <LogOut/>
                                                Sign out
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="lg:hidden"
                                aria-expanded={menuOpen}
                                aria-controls="family-menu"
                                aria-label={gt("Open menu")}
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                {menuOpen ? <X/> : <Menu/>}
                            </Button>
                        </>
                        :
                        <>
                            <LanguageSwitcher/>
                            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                                Family recipes
                                <ArrowUpRight className="size-3.5"/>
                            </span>
                        </>
                    }
                </div>
            </nav>

            {currentUser && menuOpen &&
                <div id="family-menu" className="border-t px-5 py-5 lg:hidden">
                    <div className="mx-auto flex max-w-xl flex-col gap-2">
                        {[...navItems, { icon: Plus, to: "/add-recipe" as const, name: gt("Add a recipe") }].map(item =>
                            <Link
                                to={item.to}
                                key={item.to}
                                onClick={() => setMenuOpen(false)}
                                className={cn("flex items-center gap-3 rounded-xl p-3 text-sm", pathname === item.to
                                    && "bg-accent text-accent-foreground")}
                            >
                                <item.icon className="size-4"/>
                                {item.name}
                            </Link>
                        )}
                    </div>
                </div>}
        </header>
    );
};
