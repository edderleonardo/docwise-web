"use client";

import { useCallback, useState } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useUpload } from "@/hooks/useUpload";

export function FileUploader() {
  const { upload, status, error } = useUpload();
  const { max_pdf_size_mb } = useAppConfig();
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) upload(file, max_pdf_size_mb);
    },
    [upload, max_pdf_size_mb],
  );

  // Handle click to browse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file, max_pdf_size_mb);
  };

  const isUploading = status === "uploading" || status === "processing";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Drop zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center
          w-full h-64 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3 text-center px-6">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            {isUploading ? (
              // Spinner while uploading
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              // PDF icon
              <svg
                className="w-7 h-7 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          {isUploading ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {status === "uploading"
                  ? "Uploading..."
                  : "Processing document..."}
              </p>
              <p className="text-xs text-muted-foreground">
                Generating embeddings, this may take a few seconds
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag & drop your PDF here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse — max {max_pdf_size_mb}MB
              </p>
            </div>
          )}
        </div>
      </label>

      {/* Error message */}
      {error && (
        <div className="mt-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
