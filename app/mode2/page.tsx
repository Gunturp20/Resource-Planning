"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import "../globals.css";

export default function Mode2() {
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch daftar file saat komponen dimount
  useEffect(() => {
    fetch("https://resource-planning.onrender.com/api/test-list")
      .then((res) => res.json())
      .then((data) => {
        setTestFiles(data.files || []);
      })
      .catch((err) => console.error("Gagal fetch list test:", err));
  }, []);

  const handleDownload = () => {
    if (!selectedFile) return alert("⚠️ Pilih file terlebih dahulu!");
    setLoading(true);
    fetch(`https://resource-planning.onrender.com/api/download-test/${selectedFile}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedFile;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Test Result Resource Planning
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        {/* 🔽 Dropdown File */}
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          <option value="">-- Pilih File Test --</option>
          {testFiles.map((file, index) => (
            <option key={index} value={file}>
              {file}
            </option>
          ))}
        </select>

        {/* ⬇️ Tombol Download */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2 rounded-lg"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Test File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
