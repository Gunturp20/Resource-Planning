"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import "../globals.css";


const modemData = [
  { name: "HT2300", minSymbolRate: 2, maxSymbolRate: 236 },
  { name: "UHP-100", minSymbolRate: 0.3, maxSymbolRate: 500 },
  { name: "UHP-1000", minSymbolRate: 0.3, maxSymbolRate: 32 },
  { name: "NEWTEC MDM3310", minSymbolRate: 0.32, maxSymbolRate: 20 },
];

const modcodOptions = [
  { label: "QPSK 1/2", snr: 1.0, fec: 0.5 },
  { label: "QPSK 3/4", snr: 2.8, fec: 0.75 },
  { label: "8PSK 3/4", snr: 6.4, fec: 0.75 },
  { label: "16APSK 2/3", snr: 9.2, fec: 0.6667 },
  { label: "16APSK 5/6", snr: 11.5, fec: 0.8333 },
  { label: "32APSK 3/4", snr: 13.2, fec: 0.75 },
];

const rofOptions = ["0.05", "0.2", "0.25", "0.35"];

export default function SymbolRateCalculator() {
  const [dataRate, setDataRate] = useState("");
  const [selectedModcod, setSelectedModcod] = useState(null);
  const [rof, setRof] = useState("0.2");
  const [margin, setMargin] = useState("");
  const [symbolRate, setSymbolRate] = useState("");
  const [bandwidth, setBandwidth] = useState("");
  const [recommendedModems, setRecommendedModems] = useState([]);
  const [selectedModem, setSelectedModem] = useState(null);

  // State untuk BoQ
  const [boqList, setBoqList] = useState([]);
  const [selectedBoq, setSelectedBoq] = useState("");

  // Fetch daftar BoQ saat komponen dimuat
  useEffect(() => {
    fetch("http://localhost:5000/api/boq-list")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data BoQ:", data); // Debugging
        if (data.boqFiles) {  // Perbaiki dari 'files' ke 'boqFiles'
          setBoqList(data.boqFiles);
        } else {
          console.error("Error: Properti 'boqFiles' tidak ditemukan dalam respons", data);
          setBoqList([]); // Pastikan tidak undefined
        }
      })
      .catch((error) => {
        console.error("Error fetching BoQ list:", error);
        setBoqList([]); // Tangani error agar tidak undefined
      });
  }, []);  
  

  const fetchSymbolRate = async () => {
    if (!dataRate || !selectedModcod) {
      alert("⚠️ Harap isi semua input sebelum menghitung.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataRate: parseFloat(dataRate),
          fec: selectedModcod.fec,
          modulation: selectedModcod.label.split(" ")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Server error. Periksa kembali backend.");
      }

      const result = await response.json();
      setSymbolRate(result.symbolRate);

      const calculatedBandwidth = (parseFloat(result.symbolRate) * (1 + parseFloat(rof))).toFixed(2);
      setBandwidth(calculatedBandwidth);

      const suitableModems = modemData.filter(
        (modem) => result.symbolRate >= modem.minSymbolRate && result.symbolRate <= modem.maxSymbolRate
      );
      setRecommendedModems(suitableModems);
      setSelectedModem(suitableModems.length > 0 ? suitableModems[0].name : null);
    } catch (error) {
      console.error("Error fetching symbol rate:", error);
      alert("⚠️ Gagal menghitung symbol rate. Periksa koneksi atau server.");
      setSymbolRate("Error");
    }
  };

  const handleDownloadBoq = () => {
    if (!selectedBoq) {
      alert("⚠️ Pilih BoQ terlebih dahulu!");
      return;
    }
  
    console.log("Mengunduh file:", selectedBoq); // Debugging
  
    fetch(`http://localhost:5000/api/download-boq/${selectedBoq}/${selectedModem}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`❌ Gagal mengunduh file: ${response.statusText}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (blob.size === 0) {
          throw new Error("⚠️ File kosong, periksa backend!");
        }
  
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Updated_${selectedBoq}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading BoQ:", error);
        alert(error.message || "❌ Terjadi kesalahan saat mengunduh file.");
      });
  };
  
    

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl shadow-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Resource Planning LBA Modem</h2>
        <CardContent>
          <div className="space-y-4">
            <Label>Data Rate (Mbps)</Label>
            <Input type="number" value={dataRate} onChange={(e) => setDataRate(e.target.value)} />

            <Label>Modcod</Label>
            <Select onValueChange={(value) => setSelectedModcod(modcodOptions.find(m => m.label === value))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Modcod" />
              </SelectTrigger>
              <SelectContent>
                {modcodOptions.map((mod) => (
                  <SelectItem key={mod.label} value={mod.label}>{mod.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              Roll-Off Factor
              <span
                className="ml-2 cursor-pointer text-blue-500"
                title="Rof berpengaruh terhadap BW semakin besar ROF maka BW yang dibutuhkan semakin besar."
                >
                  ℹ️
                </span>
              </Label>
            <Select onValueChange={(value) => setRof(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ROF" />
              </SelectTrigger>
              <SelectContent>
                {rofOptions.map((rofVal) => (
                  <SelectItem key={rofVal} value={rofVal}>{rofVal}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Margin (dB)</Label>
            <Input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} />

            <Button className="w-full text-white bg-blue-600 hover:bg-blue-700" onClick={fetchSymbolRate}>
              Hitung Symbol Rate
            </Button>

            {symbolRate && (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-lg font-semibold">Symbol Rate: {symbolRate} Msps</p>
                <p className="text-lg font-semibold">Bandwidth: {bandwidth} MHz</p>
              </div>
            )}

            {recommendedModems.length > 0 && (
              <div>
                <Label>Pilih Rekomendasi Modem</Label>
                <Select onValueChange={setSelectedModem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Modem" />
                  </SelectTrigger>
                  <SelectContent>
                    {recommendedModems.map((modem) => (
                      <SelectItem key={modem.name} value={modem.name}>{modem.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Label>Pilih Template BoQ</Label>
            <Select onValueChange={setSelectedBoq}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih BoQ" />
              </SelectTrigger>
              <SelectContent>
                {boqList.map((boq, index) => (
                  <SelectItem key={index} value={boq}>{boq}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="w-full text-white bg-green-600 hover:bg-green-700" onClick={handleDownloadBoq} disabled={!selectedBoq}>
              📥 Download BoQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
