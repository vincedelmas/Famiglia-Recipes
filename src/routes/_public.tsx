import {createFileRoute, redirect} from "@tanstack/react-router";


export const Route = createFileRoute("/_public")({
    validateSearch: (search): { authExpired?: boolean } => ({
        authExpired: search.authExpired === true || search.authExpired === "true" || undefined,
    }),
    beforeLoad: ({ context: { queryClient, authOptions }, search }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);
        
        if (search.authExpired) {
            queryClient.clear();
            throw redirect({ to: "/", search: {}, replace: true });
        }

        if (currentUser) {
            throw redirect({ to: "/dashboard", replace: true });
        }
    },
});
