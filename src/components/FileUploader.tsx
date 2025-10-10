'use client'

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

interface FileUploaderProps {
    name: string;
    required?: boolean;
    value?: File[]; // controlled form value
    onChange?: (files: File[]) => void; // updater from parent
}

interface FilePreviewProps {
    files: File[];
}

const FilePreview = ({ files }: FilePreviewProps) => {

    // generate URLs
    const previewObjectUrls = files.map((f) => URL.createObjectURL(f));

    // cleanup URLs on unmount or when files change
    useEffect(() => {
        return () => {
            previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    const visiblePreviews = previewObjectUrls.slice(0, 4);
    const extraCount = previewObjectUrls.length - 4;
    return (
        <section>
            <h6 className="font-bold flex gap-1">
                <span>Files</span>
                <span>{files.length}</span>
            </h6>
            <ul className="grid grid-cols-[repeat(auto-fill,_minmax(80px,_1fr))] gap-1.5 place-items-center">
                {/* preview item */}
                {visiblePreviews.map((preview, idx) => (
                    <li key={idx}>
                        <div className="w-20 h-20 rounded-md overflow-hidden shadow-md">
                            <img
                                src={preview}
                                alt={`Preview ${idx}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </li>
                ))}
                {/* +N more tile */}
                {extraCount > 0 && (
                    <li>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    +{extraCount}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>All Files ({files.length})</DialogTitle>
                                    <DialogDescription>
                                        Make changes to your profile here. Click save when you&apos;re
                                        done.
                                    </DialogDescription>
                                </DialogHeader>
                                <section className="h-100 overflow-auto">
                                    <div className="grid grid-cols-[repeat(auto-fill,_minmax(120px,_1fr))] gap-2 mt-4 place-items-center">
                                        {previewObjectUrls.map((preview, idx) => (
                                            <div
                                                key={idx}
                                                className="w-30 aspect-square rounded-md overflow-hidden shadow-md"
                                            >
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${idx}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </DialogContent>
                        </Dialog>
                    </li>
                )}
            </ul>

        </section>
    )
}

export const FileUploader = ({ name, required, value, onChange }: FileUploaderProps) => {
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (incomingFiles) => {
            const newFiles = [...(value ?? []), ...incomingFiles];

            // sync to hidden input
            if (hiddenInputRef.current) {
                const dataTransfer = new DataTransfer();
                newFiles.forEach((file) => dataTransfer.items.add(file));
                hiddenInputRef.current.files = dataTransfer.files;
            }

            // lift state up if in form
            onChange?.(newFiles);
        },
    });


    return (
        <section className="container">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
            >
                <input
                    type="file"
                    name={name}
                    required={required}
                    style={{ opacity: 0 }}
                    ref={hiddenInputRef}
                    multiple
                />
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                    <p className="text-lg font-medium">Drop the files here...</p>
                ) : (
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Drag & drop files here, or click to select</p>
                        <p className="text-sm text-muted-foreground">Upload up to 10 files of 10 MB each</p>
                        <p className="text-xs text-muted-foreground">Supports: Images, PDFs, Documents, Text files</p>
                    </div>
                )}
            </div>

            {/* To show the selected files */}
            <FilePreview files={value as File[]} />
        </section>
    );
};

export default FileUploader;