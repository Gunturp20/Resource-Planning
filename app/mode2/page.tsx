"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import "../globals.css";

export default function Mode2() {
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch daftar file saat komponen dimount
  useEffect(() => {
    fetch("https://resource-planning.onrender.com/api/test-list")
      .then((res) => res.json())
      .then((data) => {
        setTestFiles(data.files || []);
        setFilteredFiles(data.files || []);
      })
      .catch((err) => console.error("Gagal fetch list test:", err));
  }, []);

  // Update filteredFiles secara real-time berdasarkan searchTerm
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFiles(testFiles);
    } else {
      const filtered = testFiles.filter((file) =>
        file.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, testFiles]);

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
        {/* 🔍 Search Input */}
        <Input
          type="text"
          placeholder="Cari nama file..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* 🔽 Dropdown File */}
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6"
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
        >
          <option value="">-- Pilih File Test --</option>
          {filteredFiles.map((file, index) => (
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
