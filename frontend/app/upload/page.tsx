"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have this utility

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setUploadComplete(false);
    };

    const removeFile = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleUpload = () => {
        if (files.length === 0) return;
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);
            setFiles([]); // Clear files after "upload"
            alert("Documents uploaded for OCR extraction! (Mock)");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center pt-8 md:pt-10">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-2">Upload Documents</h1>
                <p className="text-muted-foreground mb-6 text-sm">
                    Upload receipts, invoices, or statements for automatic data extraction.
                </p>

                {/* Drop Zone */}
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleChange}
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Files to upload</h3>
                        {files.map((file, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-muted rounded-md">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(idx)} className="p-1 hover:bg-muted rounded-full">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || isUploading}
                    className={cn(
                        "w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all",
                        files.length > 0 && !isUploading
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : uploadComplete ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Uploaded!
                        </>
                    ) : (
                        "Upload for Extraction"
                    )}
                </button>
            </div>
        </div>
    );
}
