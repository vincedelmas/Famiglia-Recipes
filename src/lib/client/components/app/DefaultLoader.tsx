import {useGT} from "gt-react";
import {Skeleton} from "~/lib/client/components/ui/skeleton";


export const DefaultLoader = () => {
    const gt = useGT();

    return (
        <div className="py-12" role="status" aria-label={gt("Loading…")}>
            <span className="sr-only">
                Loading…
            </span>

            <Skeleton className="mb-4 h-3 w-32"/>
            <Skeleton className="mb-8 h-12 w-2/3 max-w-md"/>
            <Skeleton className="mb-10 h-64 w-full rounded-3xl"/>

            <div className="recipe-grid">
                {[0, 1, 2, 3].map(item =>
                    <div key={item} className="flex flex-col gap-4">
                        <Skeleton className="aspect-4/3 rounded-2xl"/>
                        <Skeleton className="h-5 w-3/4"/>
                        <Skeleton className="h-3 w-1/2"/>
                    </div>
                )}
            </div>
        </div>
    );
};
