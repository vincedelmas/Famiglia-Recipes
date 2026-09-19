import {BookOpen} from "lucide-react";
import {ErrorComponent} from "~/lib/client/components/app/ErrorComponent";


export function NotFound() {
    return (
        <ErrorComponent
            icon={<BookOpen/>}
            title={<>Page not found</>}
            text={<>Check the address or return to home.</>}
        />
    );
}
