import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";

// All possible states during the upload flow
type UploadStatus = "idle" | "uploading" | "processing" | "ready" | "error";

export function useUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const upload = async (file: File, maxSizeMb: number = 10) => {
    // Validate file type before even hitting the backend
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    // Validate file size — same limit as the backend
    const maxSize = maxSizeMb * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSizeMb}MB`);
      return;
    }

    try {
      setStatus("uploading");
      setError(null);
      setFilename(file.name);

      // Send to backend — this generates chunks + embeddings
      const response = await uploadDocument(file);

      setStatus("ready");

      // Redirect to chat page with the session_id
      router.push(`/chat/${response.session_id}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setFilename(null);
  };

  return { upload, reset, status, error, filename };
}
