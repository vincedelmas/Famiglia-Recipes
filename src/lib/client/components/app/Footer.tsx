import {Leaf} from "lucide-react";


export const Footer = () => {
    return (
        <footer className="mt-8 border-t">
            <div className="mx-auto flex max-w-330 flex-col items-center justify-between gap-3 px-5 py-7 text-xs text-muted-foreground
            sm:flex-row sm:px-8 lg:px-12">
                <span className="flex items-center gap-2">
                    <Leaf className="size-3.5"/>
                    Recipes shared by the family.
                </span>
                <span>
                    Famiglia · {new Date().getFullYear()}
                </span>
            </div>
        </footer>
    );
};
