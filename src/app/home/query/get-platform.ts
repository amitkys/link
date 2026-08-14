import { getPlatform } from "@/app/home/lib/action";
import { queryOptions, useQuery } from "@tanstack/react-query";
export function useGetPlatform() {
    return queryOptions({
        queryKey: ["get-platform"],
        queryFn: async () => {
            const res = await getPlatform();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        }
    })
}

export function useGetGlobalPlatformQuery() {
    return useQuery(useGetPlatform());
}