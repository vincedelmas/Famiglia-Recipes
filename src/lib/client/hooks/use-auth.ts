import {useQuery} from "@tanstack/react-query";
import {getRouteApi} from "@tanstack/react-router";


export const useAuth = () => {
    const { authOptions } = getRouteApi("__root__").useRouteContext();
    const { data: currentUser, isLoading, isPending } = useQuery(authOptions);

    return {
        isLoading,
        isPending,
        currentUser: currentUser
    };
};
