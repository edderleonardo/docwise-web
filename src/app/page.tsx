"use client";

import { FileUploader } from "@/components/FileUploader";
import { useAppConfig } from "@/hooks/useAppConfig";

export default function Home() {
  const config = useAppConfig();

  const steps = [
    {
      n: "1",
      title: "Upload",
      text: `Drop in any PDF up to ${config.max_pdf_size_mb}MB. It gets chunked and embedded on the fly.`,
    },
    {
      n: "2",
      title: "Ask",
      text: `Chat with your document — up to ${config.max_questions} questions per session.`,
    },
    {
      n: "3",
      title: "Forgotten",
      text: `Sessions self-delete after ${config.session_ttl_hours}h of inactivity, or instantly with ✕.`,
    },
  ];

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <main className="w-full max-w-3xl flex flex-col items-center gap-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Docwise
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a PDF and chat with your document
          </p>
        </div>

        <FileUploader />

        {/* How it works */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-border bg-card px-4 py-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted text-xs font-semibold flex items-center justify-center text-foreground">
                  {step.n}
                </span>
                <h2 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </section>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center max-w-md leading-relaxed">
          🔒 We never store your data permanently. Your document and chat live
          only inside your session and are wiped automatically — nothing is
          kept, shared, or used for anything else.
        </p>
      </main>
    </div>
  );
}
