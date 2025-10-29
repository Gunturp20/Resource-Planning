"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TableRow {
  modcod: string;
  snrRequired: number;
  snrAvailable: number;
  status: string;
  maxDataRateMbps: number | null;
  symbolRateMsps: number | null;
  bandwidthMhz: number | null;
}

const antennaOptions = [
  { label: "0.97m Ku", value: "0.97" },
  { label: "1.2m Ku", value: "1.2" },
  { label: "1.8m Ku", value: "1.8" },
  { label: "2.4m Ku", value: "2.4" },
];

const bucOptions = [
  { label: "4W", value: "4" },
  { label: "8W", value: "8" },
  { label: "16W", value: "16" },
];

export default function CapacityPlanner() {
  const [selectedAntenna, setSelectedAntenna] = useState<string | null>(null);
  const [selectedBuc, setSelectedBuc] = useState<string | null>(null);
  const [resultTable, setResultTable] = useState<TableRow[]>([]);

  const fetchCapacityTable = async () => {
    if (!selectedAntenna || !selectedBuc) {
      alert("⚠️ Pilih antena dan BUC dulu!");
      return;
    }

    try {
      const response = await fetch("https://resource-planning.onrender.com/api/capacity-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          antenna: selectedAntenna,
          buc: selectedBuc,
        }),
      });

      const data = await response.json();
      setResultTable(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Server gagal merespon endpoint /api/capacity-table");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl shadow-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">VSAT Capacity Planner</h2>

        <CardContent className="space-y-4">
          
          {/* Antenna */}
          <Label>Antenna</Label>
          <Select onValueChange={setSelectedAntenna}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih ukuran antenna" />
            </SelectTrigger>
            <SelectContent>
              {antennaOptions.map((ant) => (
                <SelectItem key={ant.value} value={ant.value}>
                  {ant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* BUC */}
          <Label>BUC Power</Label>
          <Select onValueChange={setSelectedBuc}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih power BUC" />
            </SelectTrigger>
            <SelectContent>
              {bucOptions.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={fetchCapacityTable}>
            Generate Capacity Table
          </Button>

          {/* Result Table */}
          {resultTable.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100 border">
                  <tr>
                    <th className="p-2 border">Modcod</th>
                    <th className="p-2 border">Req SNR</th>
                    <th className="p-2 border">Avail SNR</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Max Data Rate</th>
                    <th className="p-2 border">SR</th>
                    <th className="p-2 border">BW</th>
                  </tr>
                </thead>
                <tbody>
                  {resultTable.map((row, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="border p-1">{row.modcod}</td>
                      <td className="border p-1">{row.snrRequired} dB</td>
                      <td className="border p-1">{row.snrAvailable} dB</td>
                      <td className={`border p-1 ${row.status === "OK" ? "text-green-600" : "text-red-600"}`}>
                        {row.status}
                      </td>
                      <td className="border p-1">{row.maxDataRateMbps ?? "-"}</td>
                      <td className="border p-1">{row.symbolRateMsps ?? "-"}</td>
                      <td className="border p-1">{row.bandwidthMhz ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
