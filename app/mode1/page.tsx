"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import "../globals.css";

type TableRow = {
  modcod: string;
  snrRequired: number;
  snrAvailable: number;
  status: string;
  maxDataRateMbps: string | null;
  symbolRateMsps: number | null;
  bandwidthMhz: number | null;
};

const initialTable: TableRow[] = [
  { modcod: "QPSK 1/2", snrRequired: 3.5, snrAvailable: 8, status: "", maxDataRateMbps: null, symbolRateMsps: null, bandwidthMhz: null },
  { modcod: "QPSK 3/4", snrRequired: 5, snrAvailable: 8, status: "", maxDataRateMbps: null, symbolRateMsps: null, bandwidthMhz: null },
  { modcod: "8PSK 2/3", snrRequired: 7, snrAvailable: 8, status: "", maxDataRateMbps: null, symbolRateMsps: null, bandwidthMhz: null },
  { modcod: "8PSK 3/4", snrRequired: 9, snrAvailable: 8, status: "", maxDataRateMbps: null, symbolRateMsps: null, bandwidthMhz: null },
];

export default function CapacityTableCalculator() {
  const [selectedAntenna, setSelectedAntenna] = useState<string | null>(null);
  const [selectedBuc, setSelectedBuc] = useState<string | null>(null);
  const [resultTable, setResultTable] = useState<TableRow[]>(initialTable);

  const calculateTable = () => {
    if (!selectedAntenna || !selectedBuc) {
      alert("⚠️ Pilih antena dan BUC dulu!");
      return;
    }

    const antennaGain = Number(selectedAntenna);
    const bucPower = Number(selectedBuc);

    const updated = initialTable.map(row => {
      const margin = row.snrAvailable - row.snrRequired;
      const status = margin >= 0 ? "OK" : "NOK";

      const maxDataRateMbps =
        status === "OK" ? (antennaGain * bucPower * 0.5).toFixed(1) : null;

      return {
        ...row,
        status,
        maxDataRateMbps,
        symbolRateMsps: status === "OK" ? 3.2 : null,
        bandwidthMhz: status === "OK" ? 3.5 : null,
      };
    });

    setResultTable(updated);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-5xl shadow-xl bg-white">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Capacity Planning Table
          </h2>

          {/* Antenna */}
          <div>
            <Label>Pilih Antenna Gain (dBi)</Label>
            <Select onValueChange={(val) => setSelectedAntenna(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Antenna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="38">38 dBi</SelectItem>
                <SelectItem value="42">42 dBi</SelectItem>
                <SelectItem value="45">45 dBi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BUC */}
          <div>
            <Label>Pilih BUC Power (Watt)</Label>
            <Select onValueChange={(val) => setSelectedBuc(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih BUC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4W</SelectItem>
                <SelectItem value="8">8W</SelectItem>
                <SelectItem value="16">16W</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full bg-blue-600 text-white" onClick={calculateTable}>
            🔍 Hitung Capacity Table
          </Button>

          {/* Table Output */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Modcod</th>
                  <th className="border p-2">SNR Required</th>
                  <th className="border p-2">SNR Available</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Max Data Rate (Mbps)</th>
                  <th className="border p-2">Symbol Rate (Msps)</th>
                  <th className="border p-2">Bandwidth (MHz)</th>
                </tr>
              </thead>
              <tbody>
                {resultTable.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2">{row.modcod}</td>
                    <td className="border p-2">{row.snrRequired}</td>
                    <td className="border p-2">{row.snrAvailable}</td>
                    <td className={`border p-2 font-bold ${row.status === "OK" ? "text-green-600" : "text-red-600"}`}>
                      {row.status}
                    </td>
                    <td className="border p-2">{row.maxDataRateMbps ?? "-"}</td>
                    <td className="border p-2">{row.symbolRateMsps ?? "-"}</td>
                    <td className="border p-2">{row.bandwidthMhz ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
