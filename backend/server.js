const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const BOQ_FOLDER = path.join(__dirname, "BoQ");
const TEST_FOLDER = path.join(__dirname, "TestResults"); // ✅ Folder hasil test
const SOP_FOLDER = path.join(__dirname, "SOPFiles"); // ✅ Folder SOP
const testDatesPath = path.join(__dirname, "Testdates.json");

// Endpoint GET untuk informasi API
app.get("/api/calculate", (req, res) => {
    res.json({ message: "Use POST request to perform calculations." });
});

// Endpoint POST untuk menghitung Symbol Rate
app.post("/api/calculate", (req, res) => {
    const { dataRate, fec, modulation } = req.body;

    if (!dataRate || !fec || !modulation) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    const modulationEfficiency = {
        "QPSK": 2,
        "8PSK": 3,
        "16APSK": 4,
        "32APSK": 5,
    };

    const bps = modulationEfficiency[modulation];

    if (!bps) {
        return res.status(400).json({ error: "Invalid modulation" });
    }

    const symbolRate = (parseFloat(dataRate) / (bps * fec)).toFixed(2);

    res.json({ symbolRate });
});

// 📌 Endpoint untuk mendapatkan daftar BoQ yang tersedia
app.get("/api/boq-list", (req, res) => {
    fs.readdir(BOQ_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Gagal membaca folder BoQ" });
        }
        res.json({ boqFiles: files });
    });
});

// 📌 Endpoint untuk mengambil dan memodifikasi BoQ dengan modem yang dipilih
app.get("/api/download-boq/:boqName/:modem", (req, res) => {
    const { boqName, modem } = req.params;
    const filePath = path.join(BOQ_FOLDER, boqName);
    const newFilePath = path.join(BOQ_FOLDER, `Updated_${boqName}`);

    if (!fs.existsSync(filePath)) {
        console.error("❌ File BoQ tidak ditemukan:", filePath);
        return res.status(404).json({ error: "File BoQ tidak ditemukan" });
    }

    const command = `python modify_excel.py "${filePath}" "${newFilePath}" "${modem}"`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Error saat menjalankan skrip Python:", error);
            return res.status(500).json({ error: "Gagal memproses file BoQ" });
        }
        console.log(stdout);

        res.download(newFilePath, `Updated_${boqName}`, (err) => {
            if (err) {
                console.error("❌ Gagal mengirim file:", err);
            } else {
                console.log("📤 File berhasil dikirim.");
                fs.unlink(newFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("❌ Gagal menghapus file sementara:", unlinkErr);
                    } else {
                        console.log("🗑️ File sementara dihapus.");
                    }
                });
            }
        });
    });
});

// ✅ Endpoint untuk mendapatkan daftar file hasil test (PDF, Word, dll.) DENGAN testDate manual
app.get("/api/test-list", (req, res) => {
    fs.readFile(testDatesPath, "utf-8", (err, data) => {
        if (err) {
            console.error("❌ Gagal membaca Testdates.json:", err);
            return res.status(500).json({ error: "Gagal membaca data tanggal test" });
        }

        let testDates;
        try {
            testDates = JSON.parse(data);
        } catch (parseError) {
            console.error("❌ Gagal parsing testDates.json:", parseError);
            return res.status(500).json({ error: "Data tanggal test tidak valid" });
        }

        fs.readdir(TEST_FOLDER, (err, files) => {
            if (err) {
                return res.status(500).json({ error: "Gagal membaca folder TestResults" });
            }

            const fileData = files.map((file) => {
                return {
                    filename: file,
                    testDate: testDates[file] || "Tanggal tidak diketahui"
                };
            });

            res.json({ files: fileData });
        });
    });
});


// ✅ Endpoint untuk download file hasil test
app.get("/api/download-test/:fileName", (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(TEST_FOLDER, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File tidak ditemukan" });
    }

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("❌ Gagal mengirim file hasil test:", err);
        } else {
            console.log("📤 File test berhasil dikirim:", fileName);
        }
    });
});

app.get("/api/sop-list", (req, res) => {
    fs.readFile(testDatesPath, "utf-8", (err, data) => {
        if (err) {
            console.error("❌ Gagal membaca testDates.json:", err);
            return res.status(500).json({ error: "Gagal membaca data tanggal file" });
        }

        let testDates;
        try {
            testDates = JSON.parse(data);
        } catch (parseError) {
            console.error("❌ Gagal parsing testDates.json:", parseError);
            return res.status(500).json({ error: "Data tanggal tidak valid" });
        }

        fs.readdir(SOP_FOLDER, (err, files) => {
            if (err) {
                return res.status(500).json({ error: "Gagal membaca folder sopfiles" });
            }

            const fileData = files.map((file) => ({
                filename: file,
                testDate: testDates[file] || "Tanggal tidak diketahui"
            }));

            res.json({ files: fileData });
        });
    });
});


// ✅ Endpoint untuk download file hasil test
app.get("/api/download-sop/:fileName", (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(SOP_FOLDER, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File tidak ditemukan" });
    }

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error("❌ Gagal mengirim file hasil test:", err);
        } else {
            console.log("📤 File test berhasil dikirim:", fileName);
        }
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
