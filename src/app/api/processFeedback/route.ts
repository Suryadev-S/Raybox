import { emitter } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";


// Currently, every connected client receives every emitter event.
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const headers = new Headers({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                // helper to send proper SSE-formatted messages
                const sendEvent = (event: string, data: any) => {
                    controller.enqueue(
                        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
                    );
                };

                const onUpdate = (data: { msg: string; progress: number }) => {
                    sendEvent("process_update", data);
                };

                const onFinish = (data: { fileName: string }) => {
                    sendEvent("process_finish", data);
                };

                // Attach event listeners
                emitter.on("process_update", onUpdate);
                emitter.on("process_finish", onFinish);

                // Handle client disconnect (important!)
                req.signal.addEventListener("abort", () => {
                    emitter.off("process_update", onUpdate);
                    emitter.off("process_finish", onFinish);
                    controller.close();
                });
            },
        });

        return new Response(stream, { headers });
    } catch (error) {
        console.error("SSE error:", error);
        return NextResponse.json("error", { status: 500 });
    }
}