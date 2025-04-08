"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import "../globals.css";

export default function Mode2() {
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://resource-planning.onrender.com/api/test-list")
      .then((res) => res.json())
      .then((data) => {
        setTestFiles(data.files || []);
      })
      .catch((err) => console.error("Gagal fetch list test:", err));
  }, []);

  const handleDownload = (filename: string) => {
    setDownloadingFile(filename);
    fetch(`https://resource-planning.onrender.com/api/download-test/${filename}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Gagal mengunduh file:", err);
        alert("❌ Gagal mengunduh file. Coba lagi nanti.");
      })
      .finally(() => setDownloadingFile(null));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Test Result Resource Planning
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        {testFiles.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada file tersedia.</p>
        ) : (
          testFiles.map((file, index) => (
            <Button
              key={index}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleDownload(file)}
              disabled={downloadingFile === file}
            >
              {downloadingFile === file ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {file}
                </>
              )}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
