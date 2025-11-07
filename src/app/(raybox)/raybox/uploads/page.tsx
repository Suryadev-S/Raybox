'use client'

import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Progress } from "@/components/ui/progress";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { CopyIcon, EyeIcon, File, FileIcon, ImageIcon } from "lucide-react";
import { FileUploadStatus } from "@/lib/types";
import FileUploadList from "@/components/FileUploadList";
import { title } from "process";

type ServerSentData = {
    msg: string;
    progress: number;
};

type UploadStats = {
    total: number,
    completed: number,
    failed: number,
    uploading: number
}

interface FilePreviewProps {
    files: File[];
}

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

const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);

const FilePreview = ({ files }: FilePreviewProps) => {
    const [previews, setPreviews] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!files || files.length === 0) {
            setPreviews({});
            return;
        }

        const map: Record<string, string> = {};
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                map[file.name] = URL.createObjectURL(file);
            }
        });
        setPreviews(map);

        // Cleanup URLs when files change
        return () => {
            Object.values(map).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-xl p-4">
                No files selected
            </div>
        );
    }

    return (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            {files.map((file, idx) => {
                const previewUrl = previews[file.name];
                const isImage = file.type.startsWith("image/");
                const sizeKB = (file.size / 1024).toFixed(1);

                return (
                    <li
                        key={idx}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                        <div className="flex-shrink-0 w-7 h-7 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            {isImage && previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={file.name}
                                    className="w-[25px] h-[25px] object-cover rounded-sm"
                                />
                            ) : isImage ? (
                                <ImageIcon className="w-4 h-4 text-neutral-500" />
                            ) : (
                                <FileIcon className="w-4 h-4 text-neutral-500" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                {file.name}
                            </span>
                            <span className="text-xs text-neutral-500">{sizeKB} KB</span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

const UploadStats = ({ uploadStats }: { uploadStats: UploadStats }) => {
    return (
        <div className="mb-8 grid grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-foreground">{uploadStats.total}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{uploadStats.completed}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Uploading</p>
                <p className="text-2xl font-bold text-blue-600">{uploadStats.uploading}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{uploadStats.failed}</p>
            </div>
        </div>
    )
}


const UploadsPage = ({ params }: { params: { slug: string } }) => {
    const [fileList, setFileList] = useState<File[]>([]);
    // State to track all file uploads
    const [fileUploads, setFileUploads] = useState<FileUploadStatus[]>([])
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false); //not handled as of now in bento grid and each file http request.

    // Calculate statistics
    const uploadStats = {
        total: fileUploads.length,
        completed: fileUploads.filter((u) => u.status === "success").length,
        failed: fileUploads.filter((u) => u.status === "error").length,
        uploading: fileUploads.filter((u) => u.status === "uploading").length,
    }

    // a function to sync the fileList and fileUploads
    const handleSelectionHelper = (files: File[]) => {
        setFileList((prev) => [...prev, ...files]);
        handleFilesSelected(files);
    }

    // Cancel a specific upload in progress
    const handleCancelUpload = (uploadId: string) => {
        setFileUploads((prev) =>
            prev.map((u) => {
                if (u.id === uploadId && u.abortController) {
                    // Abort the fetch request
                    u.abortController.abort()
                    // Keep it in uploading state momentarily before resetting
                    return { ...u }
                }
                return u
            }),
        )
    }

    // Retry a failed upload
    const handleRetryUpload = (uploadId: string) => {
        const uploadToRetry = fileUploads.find((u) => u.id === uploadId)
        if (uploadToRetry) {
            uploadFile(uploadToRetry)
        }
    }

    const items = [
        {
            title: `Files (${fileList.length}/3)`,
            header: <FilePreview files={fileList} />,
            className: "md:col-span-2",
        },
        {
            title: "Upload",
            description: 'upload',
            header: <FileUploader name="files" required value={fileList} onChange={handleSelectionHelper} />,
            className: "md:col-span-1",
            icon: <File className="h-4 w-4 text-neutral-500" />
        },
    ];

    // Handle new files selected for upload
    const handleFilesSelected = (files: File[]) => {
        // Create upload status objects for each file
        const newUploads: FileUploadStatus[] = files.map((file) => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`, // unique ID
            file,
            status: "pending",
            progress: 0,
        }))

        setFileUploads((prev) => [...prev, ...newUploads])
    }

    // Start uploading all pending files
    const handleUploadAll = async () => {
        const pendingUploads = fileUploads.filter((u) => u.status === "pending")

        // Upload each file independently
        for (const upload of pendingUploads) {
            uploadFile(upload)
        }
    }
    const uploadFile = async (upload: FileUploadStatus) => {
        // Create an AbortController for this specific upload (allows cancellation)
        const abortController = new AbortController();

        // Update state to mark this file as uploading
        setFileUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading", abortController } : u)));

        try {
            // file upload using FormData
            const formData = new FormData();
            formData.append("files", upload.file);

            // axios call
            const res = await axios.post('/api/upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(percentCompleted);
                },
                signal: abortController.signal
            });

            // handle error
            if (res.status != 200) {
                throw new Error("Upload failed");
            }

            // Mark upload as successful
            setFileUploads((prev) => prev.map((u) => (u.id === upload.id ? { ...u, status: "success", progress: 100 } : u)));

        } catch (err) {
            // Handle cancellation vs other errors
            if (err instanceof Error && err.name === "AbortError") {
                setFileUploads((prev) =>
                    prev.map((u) => (u.id === upload.id ? { ...u, status: "pending", progress: 0, error: undefined } : u)),
                )
            } else {
                const errorMessage = err instanceof Error ? err.message : "Unknown error"
                setFileUploads((prev) =>
                    prev.map((u) => (u.id === upload.id ? { ...u, status: "error", error: errorMessage } : u)),
                )
            }
        }
    }

    const handleSubmit = async () => {
        if (fileList.length === 0) return;
        const formData = new FormData();
        fileList.forEach((file) => {
            formData.append("files", file); // same key for multiple files
        });

        setLoading(true);

        try {
            const res = await axios.post('/api/upload', formData, {
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
                onClick={handleUploadAll}
                disabled={fileList.length === 0 || uploadStats.uploading > 0}
            >
                {uploadStats.uploading > 0 ? "Uploading..." : "Submit"}
            </Button>
            {/* <section>
                <FileUploader name="files" required value={fileList} onChange={setFileList} />
            </section> */}
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
            <BentoGrid className="md:auto-rows-[20rem]">
                {items.map((item, i) => (
                    <BentoGridItem
                        key={i}
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        className={item.className}
                        icon={item.icon}
                    />
                ))}
            </BentoGrid>
            {/* Upload Statistics */}
            <section>
                <UploadStats uploadStats={uploadStats} />
            </section>
            <section>
                <FileUploadList uploads={fileUploads} onCancel={handleCancelUpload} onRetry={handleRetryUpload} />
            </section>
        </>
    );
};

export default UploadsPage;
