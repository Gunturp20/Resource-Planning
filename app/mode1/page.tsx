"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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

export default function CapacityTable() {
  const [selectedAntenna, setSelectedAntenna] = useState<string | null>(null);
  const [selectedBuc, setSelectedBuc] = useState<string | null>(null);
  const [resultTable, setResultTable] = useState<TableRow[]>(initialTable);

  const calculateTable = () => {
    if (!selectedAntenna || !selectedBuc) {
      alert("⚠️ Pilih antena dan BUC dulu!");
      return;
    }

    const antennaGainMap: Record<string, number> = {
      "0.97": 38,
      "1.2": 42,
      "1.8": 45,
      "2.4": 47,
    };

    const antennaGain = antennaGainMap[selectedAntenna] ?? 0;
    const bucPower = Number(selectedBuc);

    const updated = initialTable.map((row) => {
      const margin = row.snrAvailable - row.snrRequired;
      const status = margin >= 0 ? "OK ✅" : "NOK ❌";

      const maxDataRateMbps =
        status.includes("OK")
          ? (antennaGain * bucPower * 0.5).toFixed(1)
          : null;

      return {
        ...row,
        status,
        maxDataRateMbps,
        symbolRateMsps: status.includes("OK") ? 3.2 : null,
        bandwidthMhz: status.includes("OK") ? 3.5 : null,
      };
    });

    setResultTable(updated);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl shadow-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Resource Planning Table
        </h2>
        <CardContent>
          <div className="space-y-4">
            <Label>Pilih Ukuran Antenna (m)</Label>
            <Select onValueChange={(val) => setSelectedAntenna(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Antenna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.97">0.97m Ku</SelectItem>
                <SelectItem value="1.2">1.2m Ku</SelectItem>
                <SelectItem value="1.8">1.8m Ku</SelectItem>
                <SelectItem value="2.4">2.4m Ku</SelectItem>
              </SelectContent>
            </Select>

            <Label>Pilih BUC (Watt)</Label>
            <Select onValueChange={(val) => setSelectedBuc(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih BUC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4W</SelectItem>
                <SelectItem value="8">8W</SelectItem>
                <SelectItem value="16">16W</SelectItem>
                <SelectItem value="25">25W</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={calculateTable}
            >
              Hitung
            </Button>

            <table className="w-full border mt-4 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Modcod</th>
                  <th className="border p-2">SNR Req</th>
                  <th className="border p-2">SNR Avail</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Max Data Rate (Mbps)</th>
                  <th className="border p-2">Symbol Rate (Msps)</th>
                  <th className="border p-2">BW (MHz)</th>
                </tr>
              </thead>
              <tbody>
                {resultTable.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{row.modcod}</td>
                    <td className="border p-2">{row.snrRequired}</td>
                    <td className="border p-2">{row.snrAvailable}</td>
                    <td className="border p-2">{row.status}</td>
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
