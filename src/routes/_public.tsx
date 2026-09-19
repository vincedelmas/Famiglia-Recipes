import {createFileRoute, redirect} from "@tanstack/react-router";


export const Route = createFileRoute("/_public")({
    validateSearch: ({ search }) => search as { authExpired?: boolean },
    beforeLoad: async ({ context: { queryClient, authOptions }, search }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);
        
        if (search.authExpired) {
            await queryClient.invalidateQueries({ queryKey: authOptions.queryKey });
            queryClient.clear();
            throw redirect({ to: "/", replace: true });
        }

        if (currentUser) {
            throw redirect({ to: "/dashboard", replace: true });
        }
    },
});
