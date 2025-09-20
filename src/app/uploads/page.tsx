'use client'

import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from 'axios';

const UploadsPage = ({ params }: { params: { slug: string } }) => {
    const [fileList, setFileList] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
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
            });
            if (res.status != 200) {
                throw new Error("Upload failed");
            }

            const { data } = res;
            console.log("Server response:", data);
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
        </>
    );
};

export default UploadsPage;