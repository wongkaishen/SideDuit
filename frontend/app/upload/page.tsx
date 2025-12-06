"use client";

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Upload, FileText, CheckCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const filesRef = useRef<HTMLDivElement>(null);

    // Initial Entry Animation
    useGSAP(() => {
        const items = gsap.utils.toArray<HTMLElement>('.upload-item');

        gsap.set(items, {
            autoAlpha: 0,
            scale: 0.8,
            rotationX: 45,
            z: -100,
            y: 50,
            filter: 'blur(10px)',
            transformPerspective: 1000,
            transformOrigin: "center center"
        });

        gsap.to(items, {
            duration: 1.2,
            autoAlpha: 1,
            scale: 1,
            rotationX: 0,
            z: 0,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.1,
            clearProps: "all"
        });
    }, { scope: containerRef });

    // Animate new files when added
    useGSAP(() => {
        if (files.length === 0) return;

        // Target the last added file or all files if it's the first batch
        const fileItems = gsap.utils.toArray<HTMLElement>('.file-item');
        if (fileItems.length === 0) return;

        gsap.fromTo(fileItems,
            {
                autoAlpha: 0,
                x: -20,
                filter: 'blur(5px)'
            },
            {
                autoAlpha: 1,
                x: 0,
                filter: 'blur(0px)',
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.05
            }
        );
    }, { scope: filesRef, dependencies: [files.length] });

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

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        setUploadComplete(false);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('documents', file);
        });

        try {
            const response = await fetch('http://127.0.0.1:8000/finance/upload/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadComplete(true);
                setFiles([]);
                alert("Documents uploaded and processed successfully!");
            } else {
                console.error("Upload failed");
                alert("Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading files:", error);
            alert("An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 flex flex-col items-center pt-8 md:pt-10 perspective-1000">
            <div className="w-full max-w-md">
                <div className="upload-item mb-2">
                    <h1 className="text-2xl font-bold">Upload Documents</h1>
                </div>
                <div className="upload-item mb-6">
                    <p className="text-muted-foreground text-sm">
                        Upload receipts, invoices, or statements for automatic data extraction.
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    className={cn(
                        "upload-item relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
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
                <div ref={filesRef}>
                    {files.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <div className="upload-item">
                                <h3 className="text-sm font-semibold text-muted-foreground">Files to upload</h3>
                            </div>
                            {files.map((file, idx) => (
                                <div
                                    key={`${file.name}-${idx}`}
                                    className="file-item flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div className="upload-item">
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
        </div>
    );
}
