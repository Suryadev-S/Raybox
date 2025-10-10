'use client'

import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Progress } from "@/components/ui/progress";

type ServerSentData = {
    msg: string;
    progress: number;
};

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

const UploadsPage = ({ params }: { params: { slug: string } }) => {
    const [fileList, setFileList] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        if (fileList.length === 0) return;
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append("files", file); // same key for multiple files
        });

        setLoading(true);

        try {
            const res = await axios.post('/api/test', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(percentCompleted);
                },
            });
            if (res.status != 200) {
                throw new Error("Upload failed");
            }

            const { data } = res;
            // console.log("Server response:", data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <h1 className="text-4xl">Uploads page</h1>
            <Button
                onClick={handleSubmit}
                disabled={fileList.length === 0 || loading}
            >
                {loading ? "Uploading..." : "Submit"}
            </Button>
            <section>
                <FileUploader name="files" required value={fileList} onChange={setFileList} />
            </section>
            <section>
                {/* <ServerEventLogger /> */}
            </section>
            <section>
                {uploadProgress > 0 && (
                    <div className="mt-4">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground mt-1">
                            Uploading... {uploadProgress}%
                        </p>
                    </div>
                )}
            </section>
        </>
    );
};

export default UploadsPage;