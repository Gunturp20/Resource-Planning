"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import '../globals.css';

const CapacityEstimator = () => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [antennaSize, setAntennaSize] = useState<string | null>(null);
  const [bucPower, setBucPower] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);

  // Pilihan Ukuran Antena dan BUC
  const antennaSizes = [
    { label: '1.2m', value: '1.2' },
    { label: '1.8m', value: '1.8' },
    { label: '2.4m', value: '2.4' },
  ];

  const bucOptions = [
    { label: '3W', value: 3 },
    { label: '6W', value: 6 },
    { label: '10W', value: 10 },
  ];

  // Fungsi untuk membaca file Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        setFileData(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  // Fungsi untuk memfilter dan menampilkan hasil perhitungan
  const handleGenerateResults = () => {
    if (!antennaSize || !bucPower) {
      alert('⚠️ Pilih ukuran antena dan BUC terlebih dahulu.');
      return;
    }

    const filteredResults = fileData.filter((row: any) => {
      // Menyesuaikan filter berdasarkan ukuran antena dan daya BUC
      return row.Antenna === antennaSize && row.BUC === bucPower;
    });

    setResults(filteredResults);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-5xl shadow-lg bg-white">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-center">Quick Capacity Estimator</h2>

          {/* Input File Excel */}
          <div>
            <Label>Upload Excel File</Label>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          </div>

          {/* Pilihan Ukuran Antena */}
          <div>
            <Label>Select Antenna Size</Label>
            <Select onValueChange={(v) => setAntennaSize(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select antenna size" />
              </SelectTrigger>
              <SelectContent>
                {antennaSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pilihan Daya BUC */}
          <div>
            <Label>Select BUC Power (W)</Label>
            <Select onValueChange={(v) => setBucPower(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select BUC power" />
              </SelectTrigger>
              <SelectContent>
                {bucOptions.map((power) => (
                  <SelectItem key={power.value} value={String(power.value)}>
                    {power.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tombol untuk Menghasilkan Estimasi */}
