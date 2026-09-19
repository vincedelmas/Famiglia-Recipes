import {CookingPot} from "lucide-react";
import {ErrorComponent} from "~/lib/client/components/app/ErrorComponent";


export function ErrorCatchBoundary() {
    return (
        <ErrorComponent
            icon={<CookingPot/>}
            title={<>Something went wrong</>}
            text={<>An unexpected error occurred. Please try again later.</>}
        />
    );
}
