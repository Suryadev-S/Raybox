'use client'

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
    name: string;
    required?: boolean;
    value?: File[]; // controlled form value
    onChange?: (files: File[]) => void; // updater from parent
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

    // const filesToRender = value ?? [];

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

            <aside className="mt-4">
                <h4 className="font-medium">Files</h4>
                <ul className="text-sm list-disc pl-4">
                    {acceptedFiles.map((file) => (
                        <li key={file.name}>
                            {file.name} - {(file.size / 1024).toFixed(2)} KB
                        </li>
                    ))}
                </ul>
            </aside>
        </section>
    );
};

export default FileUploader;