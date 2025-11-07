'use client'

import { FileUploadStatus } from "@/lib/types"
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface FileUploadListProps {
    uploads: FileUploadStatus[]
    onCancel: (uploadId: string) => void
    onRetry: (uploadId: string) => void
}

type ServerSentData = {
    msg: string;
    progress: number;
};

// server event logger is having problem due to multip open connections.
// logs per file is not identifiable, thus duplicating the logs.
// solution: attach fileId from backend and filter in the frontend
const ServerEventLogger = () => {
    // ✅ Start with empty array (not null)
    const [eventLogs, setEventLogs] = useState<ServerSentData[]>([]);

    useEffect(() => {
        const eventSource = new EventSource("http://localhost:3000/api/processFeedback");

        // ❌ `onmessage` only works for events WITHOUT a name.
        // ✅ Use named event listeners to match your backend events.
        eventSource.addEventListener("process_update", (ev: MessageEvent) => {
            const logData = JSON.parse(ev.data) as ServerSentData;
            setEventLogs((prev) => [...prev, logData]);
        });

        // ✅ Match the name from backend: "process_finish"
        eventSource.addEventListener("process_finish", (ev: MessageEvent) => {
            const data = JSON.parse(ev.data);
            setEventLogs((prev) => [...prev, { msg: `✅ ${data.fileName} done`, progress: 100 }]);
            eventSource.close(); // stop after completion
        });

        eventSource.onerror = () => {
            setEventLogs((prev) => [...prev, { msg: "⚠️ Connection error", progress: -1 }]);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className="space-y-2 mt-4 p-3 border rounded-md bg-gray-50">
            {eventLogs.length > 0 ? (
                eventLogs.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span>{val.msg}</span>
                        <p className="text-sm text-gray-600">{val.progress}%</p>
                    </div>
                ))
            ) : (
                <span>No logs to display</span>
            )}
        </div>
    );
};

const FileUploadList = ({ uploads, onCancel, onRetry }: FileUploadListProps) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "uploading":
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />;
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
            default:
                return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "uploading":
                return "Uploading...";
            case "success":
                return "Completed";
            case "error":
                return "Failed";
            default:
                return "Pending";
        }
    };

    return (
        <ul className="overflow-y-auto space-y-4">
            {uploads.map((upload) => (
                <li
                    key={upload.id}
                    className="p-4 border rounded-lg bg-background shadow-sm hover:bg-accent/30 transition"
                >
                    <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(upload.status)}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{upload.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {getStatusText(upload.status)} • {upload.progress}%
                            </p>
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                            {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-3">
                        <Progress value={upload.progress} className="h-2" />
                    </div>

                    {/* Error Message */}
                    {upload.error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-3 mb-3">
                            <p className="text-sm text-destructive">{upload.error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {upload.status === "uploading" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCancel(upload.id)}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                        )}

                        {upload.status === "error" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRetry(upload.id)}
                            >
                                Retry Upload
                            </Button>
                        )}
                    </div>

                    {/* Server Events Section */}
                    {/* <div className="mt-3">
                        <ServerEventLogger />
                    </div> */}
                </li>
            ))}
        </ul>
    );
};

export default FileUploadList;