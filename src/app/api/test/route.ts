import { getPlatformAction } from "@/app/home/lib/action";

export async function GET(request: Request) {
    const platforms = await getPlatformAction();
    return Response.json({
        message: "Hello World",
        platforms,
    });
}