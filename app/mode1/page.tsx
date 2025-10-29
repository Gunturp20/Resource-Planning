"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import "../globals.css";

type Modcod = {
  label: string;
  snrRequired: number; // dB
  bitPerHz: number; // spectral efficiency (bit/Hz)
};

type ResultRow = {
  modcod: string;
  snrRequired: number;
  snrAvailable: number;
  margin: number;
  status: "OK" | "NOK";
  maxDataRateMbps: number | null;
  symbolRateMsps: number | null;
  bandwidthMhz: number | null;
};

const antennaGainMap: Record<string, number> = {
  "0.97": 38,
  "1.2": 42,
  "1.8": 45,
  "2.4": 47,
};

const bucOptions = [
  { label: "4W", value: 4 },
  { label: "8W", value: 8 },
  { label: "16W", value: 16 },
  { label: "25W", value: 25 },
];

// MODCOD list (label, required SNR, bit/Hz) — tambahkan/ubah sesuai referensi resmi
const modcodOptions: Modcod[] = [
  { label: "QPSK 1/2", snrRequired: 1.0, bitPerHz: 0.5 },
  { label: "QPSK 3/4", snrRequired: 2.8, bitPerHz: 0.75 },
  { label: "8PSK 3/4", snrRequired: 6.4, bitPerHz: 1.5 },
  { label: "16APSK 2/3", snrRequired: 9.2, bitPerHz: 2.0 },
  { label: "16APSK 4/5", snrRequired: 10.5, bitPerHz: 2.56 },
  { label: "16APSK 5/6", snrRequired: 11.5, bitPerHz: 2.66 },
  { label: "32APSK 3/4", snrRequired: 13.2, bitPerHz: 3.0 },
];

export default function CapacityByAntennaBuc() {
  const [antennaSize, setAntennaSize] = useState<string | null>(null);
  const [bucPower, setBucPower] = useState<number | null>(null);
  const [rof, setRof] = useState<number>(0.25); // default 25%
  const [marginDb, setMarginDb] = useState<number>(1); // default 1 dB margin
  const [results, setResults] = useState<ResultRow[] | null>(null);

  // Tunable constants (kalibrasi dengan data Excel)
  const BW_FACTOR = 0.01; // bandwidth (MHz) per (gain * bucPower) unit — ubah kalau perlu
  // availableSNR heuristic uses 10 * log10(gain * power) — you can change multiplier/offset if needed

  const calculate = () => {
    if (!antennaSize || !bucPower) {
      alert("⚠️ Pilih ukuran antena dan BUC dulu.");
      return;
    }

    const antennaGain = antennaGainMap[antennaSize] ?? 0;
    const buc = bucPower;

    // Heuristic available SNR (dB)
    // 10 * log10(antennaGain * buc) -> gives dB-ish number and scales sensibly
    const product = Math.max(antennaGain * buc, 1);
    const availableSNR = 10 * Math.log10(product);

    // Estimate available bandwidth (MHz) from hardware capability (heuristic)
    const bandwidthMhzEstimate = product * BW_FACTOR; // tune BW_FACTOR to match Excel table

    const rows: ResultRow[] = modcodOptions.map((m) => {
      const req = m.snrRequired;
      const margin = availableSNR - req;
      const feasible = availableSNR >= req + marginDb;

      if (!feasible) {
        return {
          modcod: m.label,
          snrRequired: req,
          snrAvailable: parseFloat(availableSNR.toFixed(2)),
          margin: parseFloat(margin.toFixed(2)),
          status: "NOK",
          maxDataRateMbps: null,
          symbolRateMsps: null,
          bandwidthMhz: null,
        };
      }

      // If feasible, compute max data rate from bandwidth and spectral efficiency
      // maxDataRate (Mbps) = bit/Hz * bandwidth(MHz)
      const maxDataRate = m.bitPerHz * bandwidthMhzEstimate;

      // Symbol rate (Msps) = bandwidth / (1 + ROF)
      const symbolRate = bandwidthMhzEstimate / (1 + rof);

      return {
        modcod: m.label,
        snrRequired: req,
        snrAvailable: parseFloat(availableSNR.toFixed(2)),
        margin: parseFloat(margin.toFixed(2)),
        status: "OK",
        maxDataRateMbps: parseFloat(maxDataRate.toFixed(2)),
        symbolRateMsps: parseFloat(symbolRate.toFixed(3)),
        bandwidthMhz: parseFloat(bandwidthMhzEstimate.toFixed(3)),
      };
    });

    setResults(rows);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-5xl shadow-lg bg-white">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-center">Quick Capacity Estimator</h2>

          <div>
            <Label>Pilih Ukuran Antenna</Label>
            <Select onValueChange={(v) => setAntennaSize(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih antenna size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.97">0.97 m (Ku)</SelectItem>
                <SelectItem value="1.2">1.2 m (Ku)</SelectItem>
                <SelectItem value="1.8">1.8 m (Ku)</SelectItem>
                <SelectItem value="2.4">2.4 m (Ku)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Pilih BUC (Watt)</Label>
            <Select onValueChange={(v) => setBucPower(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih BUC power" />
              </SelectTrigger>
              <SelectContent>
                {bucOptions.map((b) => (
                  <SelectItem key={b.value} value={String(b.value)}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Roll-Off (ROF)</Label>
            <Select onValueChange={(v) => setRof(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder={String(rof)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.05">0.05</SelectItem>
                <SelectItem value="0.2">0.20</SelectItem>
                <SelectItem value="0.25">0.25</SelectItem>
                <SelectItem value="0.35">0.35</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Margin (dB)</Label>
            <input
              type="number"
              className="border p-2 w-full"
              value={String(marginDb)}
              onChange={(e) => setMarginDb(Number(e.target.value))}
            />
          </div>

          <Button className="w-full bg-blue-600 text-white" onClick={calculate}>
            Generate Estimation
          </Button>

          {/* RESULTS */}
          {results && (
            <div className="mt-4 overflow-x-auto">
              <div className="mb-2 text-sm text-gray-600">
                <strong>Heuristic</strong>: availableSNR = 10·log10(antennaGain·BUC), bandwidth ≈ (antennaGain·BUC)·{BW_FACTOR} MHz. Tune constants for exact match.
              </div>

              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Modcod</th>
                    <th className="p-2 border">Req SNR (dB)</th>
                    <th className="p-2 border">Avail SNR (dB)</th>
                    <th className="p-2 border">Margin (dB)</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Max Data Rate (Mbps)</th>
                    <th className="p-2 border">SR (Msps)</th>
                    <th className="p-2 border">BW (MHz)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="text-center">
                      <td className="p-2 border">{r.modcod}</td>
                      <td className="p-2 border">{r.snrRequired}</td>
                      <td className="p-2 border">{r.snrAvailable}</td>
                      <td className="p-2 border">{r.margin}</td>
                      <td className={`p-2 border font-semibold ${r.status === "OK" ? "text-green-600" : "text-red-600"}`}>{r.status}</td>
                      <td className="p-2 border">{r.maxDataRateMbps !== null ? `${r.maxDataRateMbps.toFixed(2)} Mbps` : "-"}</td>
                      <td className="p-2 border">{r.symbolRateMsps !== null ? `${r.symbolRateMsps.toFixed(3)} Msps` : "-"}</td>
                      <td className="p-2 border">{r.bandwidthMhz !== null ? `${r.bandwidthMhz.toFixed(3)} MHz` : "-"}</td>
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
