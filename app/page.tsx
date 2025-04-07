import './globals.css';
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 gap-4">
      <h1 className="text-2xl font-bold">RESOURCE PLANNING BOQ GENERATOR & TEST RESULT FILE</h1>
      
      <Link href="/mode1">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          🚀 Symrate Calculator & Generate BoQ
        </button>
      </Link>

      <Link href="/mode2">
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          📥Test Result Download
        </button>
      </Link>
    </div>
  );
}
