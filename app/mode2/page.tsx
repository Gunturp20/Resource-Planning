"use client";
import React, { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import "../globals.css";

export default function Mode2() {
  const [testFiles, setTestFiles] = useState<{ filename: string; testDate: string }[]>([]);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="border-4 border-purple-400 rounded-xl p-8 w-full max-w-3xl">
        <h1 className="text-center text-lg font-semibold mb-6">TEST RESULT FILES</h1>

        {testFiles.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada file tersedia.</p>
        ) : (
          <div className="space-y-2">
            {testFiles.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center border border-black px-4 py-2 text-sm bg-white"
              >
                <span>{file.filename}</span>
                <span className="text-gray-500">{file.testDate}</span>
                <button
                  onClick={() => handleDownload(file.filename)}
                  disabled={downloadingFile === file.filename}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  {downloadingFile === file.filename ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Mengunduh...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
