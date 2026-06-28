"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/shared/Header";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/Toast";
import { EASE_APPLE, EASE_SPRING } from "@/lib/animations";

const stages = [
  "parsing",
  "extracting",
  "skills",
  "ats",
  "scoring",
] as const;

export default function UploadPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const simulateStages = async () => {
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }
  };

  const handleAnalyze = async () => {
    setError(null);

    if (activeTab === "file" && !file) {
      addToast("Please upload a resume file", "error");
      return;
    }
    if (activeTab === "text" && !textInput.trim()) {
      addToast("Please paste your resume text", "error");
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    simulateStages();

    try {
      let resumeId: string;

      if (activeTab === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        if (title) formData.append("title", title);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Failed to upload resume");
        }
        const uploadData = await uploadRes.json();
        resumeId = uploadData.id;
      } else {
        const formData = new FormData();
        formData.append("text", textInput);
        if (title) formData.append("title", title);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Failed to upload resume");
        }
        const uploadData = await uploadRes.json();
        resumeId = uploadData.id;
      }

      setIsUploading(false);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          type: "full_analysis",
          jobDescriptionText: jobDescription || undefined,
          locale,
        }),
      });

      if (!analyzeRes.ok) {
        const data = await analyzeRes.json();
        throw new Error(data.error || "Failed to analyze resume");
      }

      const analysisData = await analyzeRes.json();
      router.push(`/analysis/${analysisData.reportId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      addToast(msg, "error");
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
          >
            <h1 className="text-3xl font-bold mb-3">{t.upload.pageTitle}</h1>
            <p className="text-muted-foreground">{t.upload.pageSubtitle}</p>
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_APPLE }}
          >
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.upload.resumeTitle}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.upload.titlePlaceholder}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {([
                { key: "file" as const, icon: Upload, label: t.upload.uploadFile },
                { key: "text" as const, icon: FileText, label: t.upload.pasteText },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dropzone */}
            <AnimatePresence mode="wait">
              {activeTab === "file" && (
                <motion.div
                  key="file-drop"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_APPLE }}
                  className="mb-6"
                >
                  {file ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: EASE_SPRING }}
                      className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-white/[0.02]"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <motion.div
                        animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE_SPRING }}
                      >
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground">
                        {t.upload.dragDrop}{" "}
                        <span className="text-primary font-medium">{t.upload.browse}</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{t.upload.fileFormats}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "text" && (
                <motion.div
                  key="text-input"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_APPLE }}
                  className="mb-6"
                >
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your resume text here..."
                    rows={12}
                    className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none transition-all duration-200"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Job Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">{t.upload.jobDescription}</label>
              </div>
              <p className="text-xs text-muted-foreground/60 mb-3">{t.upload.jobDescriptionHint}</p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t.upload.jobDescriptionPlaceholder}
                rows={5}
                className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-none transition-all duration-200"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 p-4"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze Button */}
            <motion.button
              onClick={handleAnalyze}
              disabled={isUploading || isAnalyzing}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isUploading || isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? t.upload.uploading : t.upload.analyzing}
                </>
              ) : (
                <>
                  {t.upload.analyzeBtn}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>

            {/* Processing Stages */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-3"
                >
                  {stages.map((stage, i) => (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, y: 8 }}
                      animate={i <= currentStage ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 8 }}
                      transition={{ duration: 0.4, delay: i * 0.1, ease: EASE_APPLE }}
                      className="flex items-center gap-3 text-sm"
                    >
                      {i < currentStage ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : i === currentStage ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                      )}
                      <span className={i <= currentStage ? "text-foreground" : "text-muted-foreground/50"}>
                        {t.stages[stage]}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
