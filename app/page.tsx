"use client";
import "./globals.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex items-center border-b border-gray-300 px-6 py-4 bg-white shadow-md">
        {/* Company Logo */}
        <img
          src="/psn.png"
          alt="Company Logo"
          className="w-20 h-auto object-contain mr-4"
        />

        {/* Judul Tengah */}
        <h1 className="text-2xl font-semibold text-center flex-1">
          Resource Planning & Engineering Department
        </h1>
      </header>

      {/* Konten Utama */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {/* Mode 1 */}
          <Link href="/mode1">
            <div className="w-40 h-40 border rounded-lg flex items-center justify-center text-center text-sm hover:bg-blue-100 cursor-pointer transition">
              🚀 Symrate Calculator <br /> & Generate BoQ
            </div>
          </Link>

          {/* Mode 2 */}
          <Link href="/mode2">
            <div className="w-40 h-40 border rounded-lg flex items-center justify-center text-center text-sm hover:bg-green-100 cursor-pointer transition">
              📥 Test Result <br /> Download
            </div>
          </Link>

          {/* Mode 3 */}
          <Link href="/mode3">
            <div className="w-40 h-40 border rounded-lg flex items-center justify-center text-center text-sm hover:bg-yellow-100 cursor-pointer transition">
              🗂 SOP Files
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        copyright Resource Planning & Engineering Team 2025
      </footer>
    </div>
  );
}
