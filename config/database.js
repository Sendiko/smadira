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
                paragraf TEXT,
                foto TEXT,
                tanggal_pelaksanaan TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating proker table:", err.message);
                } else {
                    // Migration: add new columns if they don't exist yet (for existing DBs)
                    db.run(`ALTER TABLE proker ADD COLUMN paragraf TEXT`, () => {});
                    db.run(`ALTER TABLE proker ADD COLUMN foto TEXT`, () => {});

                    // Cek apakah tabel kosong, jika iya maka tambahkan dummy data
                    db.get("SELECT COUNT(*) AS count FROM proker", (err, row) => {
                        if (row && row.count === 0) {
                            const stmt = db.prepare("INSERT INTO proker (judul, deskripsi, paragraf, tanggal_pelaksanaan) VALUES (?, ?, ?, ?)");
                            stmt.run("LDKS Pengurus Baru", "Latihan Dasar Kepemimpinan untuk pengurus periode ini.", "Kegiatan LDKS (Latihan Dasar Kepemimpinan Siswa) merupakan agenda rutin tahunan yang dirancang khusus untuk membekali pengurus OSIS baru dengan kompetensi kepemimpinan, kedisiplinan, dan wawasan organisasi. Selama beberapa hari penuh, peserta akan mengikuti serangkaian sesi pelatihan intensif yang mencakup manajemen waktu, pengambilan keputusan, serta membangun komunikasi efektif di dalam tim.", "2026-05-20");
                            stmt.run("Class Meeting Pekan Raya", "Kompetisi olahraga dan seni antar kelas setelah ujian akhir.", "Class Meeting Pekan Raya adalah perayaan semangat kompetisi dan kreativitas seluruh siswa SMA DIRA. Digelar setelah selesainya ujian akhir semester, kegiatan ini menghadirkan berbagai cabang lomba mulai dari futsal, basket, voli, hingga kompetisi seni seperti menyanyi dan menggambar. Acara ini menjadi ajang pemersatu antar kelas dan angkatan.", "2026-06-12");
                            stmt.run("Pensi Kemerdekaan", "Pentas seni menyambut kemerdekaan dengan berbagai lomba.", "Pentas Seni Kemerdekaan adalah momen puncak peringatan Hari Kemerdekaan Republik Indonesia di lingkungan SMA DIRA. OSIS menghadirkan panggung hiburan berbalut semangat nasionalisme dengan penampilan band, tari tradisional, drama musikal, dan berbagai perlombaan bernuansa merah-putih. Seluruh warga sekolah diajak untuk merayakan kemerdekaan dengan rasa syukur dan kebanggaan.", "2026-08-16");
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
                jabatan TEXT NOT NULL,
                image TEXT,
                phone TEXT,
                instagram TEXT
            )`, (err) => {
                // Migration: add new columns if they don't exist yet (for existing DBs)
                db.run(`ALTER TABLE pengurus ADD COLUMN image TEXT`, () => {});
                db.run(`ALTER TABLE pengurus ADD COLUMN phone TEXT`, () => {});
                db.run(`ALTER TABLE pengurus ADD COLUMN instagram TEXT`, () => {});
                if (err) {
                    console.error("Error creating pengurus table:", err.message);
                } else {
                    // Cek apakah tabel kosong, jika iya maka tambahkan dummy data
                    db.get("SELECT COUNT(*) AS count FROM pengurus", (err, row) => {
                        if (row && row.count === 0) {
                            const stmt = db.prepare("INSERT INTO pengurus (nama, divisi, jabatan) VALUES (?, ?, ?)");
                            
                            // Inti
                            stmt.run("Rizky Sendiko", "Inti", "Ketua Umum");
                            stmt.run("Velarina Nurmalakana", "Inti", "Wakil Ketua Umum");
                            stmt.run("Budi Santoso", "Inti", "Sekertaris Umum");
                            stmt.run("Atthariq Maulana", "Inti", "Bendahara Umum");

                            // Pembinaan Organisasi & Kader & Wawasan Kebangsaan
                            stmt.run("Siti Aminah", "Pembinaan Organisasi", "Ketua Sekbid");
                            stmt.run("Rafi Ahmad", "Pembinaan Organisasi", "Wakil Ketua Sekbid");
                            stmt.run("Nadia Fitri", "Pembinaan Organisasi", "Anggota Sekbid");
                            stmt.run("Farhan Hakim", "Pembinaan Organisasi", "Anggota Sekbid");
                            stmt.run("Aulia Rahma", "Pembinaan Organisasi", "Anggota Sekbid");

                            // Kesenian & Olahraga
                            stmt.run("Andi Pratama", "Kesenian & Olahraga", "Ketua Sekbid");
                            stmt.run("Bima Sakti", "Kesenian & Olahraga", "Wakil Ketua Sekbid");
                            stmt.run("Clara Shinta", "Kesenian & Olahraga", "Anggota Sekbid");
                            stmt.run("Dimas Anggara", "Kesenian & Olahraga", "Anggota Sekbid");
                            stmt.run("Eka Putri", "Kesenian & Olahraga", "Anggota Sekbid");

                            // Humas & TIK
                            stmt.run("Faisal Tanjung", "Humas & TIK", "Ketua Sekbid");
                            stmt.run("Gina Anindya", "Humas & TIK", "Wakil Ketua Sekbid");
                            stmt.run("Hendra Saputra", "Humas & TIK", "Anggota Sekbid");
                            stmt.run("Intan Permata", "Humas & TIK", "Anggota Sekbid");
                            stmt.run("Joko Susilo", "Humas & TIK", "Anggota Sekbid");

                            // Kewirausahaan
                            stmt.run("Kiki Amalia", "Kewirausahaan", "Ketua Sekbid");
                            stmt.run("Lukman Hakim", "Kewirausahaan", "Wakil Ketua Sekbid");
                            stmt.run("Mega Puspita", "Kewirausahaan", "Anggota Sekbid");
                            stmt.run("Nurul Hidayah", "Kewirausahaan", "Anggota Sekbid");

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
