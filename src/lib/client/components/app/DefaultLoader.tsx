import {LoaderCircle} from "lucide-react";


export const DefaultLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-400px)]">
            <LoaderCircle className="size-12 animate-spin"/>
        </div>
    );
};
