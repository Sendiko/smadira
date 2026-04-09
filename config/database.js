const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure db directory exists
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'osis.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize basic tables if they don't exist
        db.serialize(() => {
            // 1. Create table 'proker'
            db.run(`CREATE TABLE IF NOT EXISTS proker (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                judul TEXT NOT NULL,
                deskripsi TEXT,
                tanggal_pelaksanaan TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating proker table:", err.message);
                } else {
                    // Cek apakah tabel kosong, jika iya maka tambahkan dummy data
                    db.get("SELECT COUNT(*) AS count FROM proker", (err, row) => {
                        if (row && row.count === 0) {
                            const stmt = db.prepare("INSERT INTO proker (judul, deskripsi, tanggal_pelaksanaan) VALUES (?, ?, ?)");
                            stmt.run("LDKS Pengurus Baru", "Latihan Dasar Kepemimpinan untuk pengurus periode ini.", "2026-05-20");
                            stmt.run("Class Meeting Pekan Raya", "Kompetisi olahraga dan seni antar kelas setelah ujian akhir.", "2026-06-12");
                            stmt.run("Pensi Kemerdekaan", "Pentas seni menyambut kemerdekaan dengan berbagai lomba.", "2026-08-16");
                            stmt.finalize();
                            console.log("Berhasil: Data palsu (dummy) untuk tabel 'proker' telah ditambahkan.");
                        }
                    });
                }
            });

            // 2. Create table 'pengurus'
            db.run(`CREATE TABLE IF NOT EXISTS pengurus (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nama TEXT NOT NULL,
                divisi TEXT NOT NULL,
                jabatan TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating pengurus table:", err.message);
                } else {
                    // Cek apakah tabel kosong, jika iya maka tambahkan dummy data
                    db.get("SELECT COUNT(*) AS count FROM pengurus", (err, row) => {
                        if (row && row.count === 0) {
                            const stmt = db.prepare("INSERT INTO pengurus (nama, divisi, jabatan) VALUES (?, ?, ?)");
                            stmt.run("Rizky Sendiko", "Inti", "Ketua Umum");
                            stmt.run("Velarina Nurmalakana", "Inti", "Wakil Ketua Umum");
                            stmt.run("Budi Santoso", "Inti", "Sekertaris Umum");
                            stmt.run("Atthariq Maulana", "Inti", "Bendahara Umum");
                            stmt.run("Siti Aminah", "Pembinaan Organisasi", "Ketua Sekbid");
                            stmt.run("Andi Pratama", "Kesenian & Olahraga", "Anggota Sekbid");
                            stmt.finalize();
                            console.log("Berhasil: Data palsu (dummy) untuk tabel 'pengurus' telah ditambahkan.");
                        }
                    });
                }
            });

            // 3. Create table 'users'
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating users table:", err.message);
                } else {
                    // Cek apakah tabel kosong, jika iya maka tambahkan admin default
                    db.get("SELECT COUNT(*) AS count FROM users", async (err, row) => {
                        if (row && row.count === 0) {
                            const salt = await bcrypt.genSalt(10);
                            const hashedPassword = await bcrypt.hash("admin123", salt);
                            db.run("INSERT INTO users (username, password) VALUES (?, ?)", ["admin", hashedPassword], (err) => {
                                if (err) {
                                    console.error("Error inserting admin user:", err.message);
                                } else {
                                    console.log("Berhasil: Data admin default telah ditambahkan (admin / admin123).");
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});

module.exports = db;
