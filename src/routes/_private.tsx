import {createFileRoute, redirect} from "@tanstack/react-router";


export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context: { queryClient, authOptions } }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);

        if (!currentUser) {
            throw redirect({ to: "/" });
        }
    },
});
