const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./config/database');

// --- Multer setup for pengurus photo uploads ---
const uploadsDir = path.join(__dirname, 'public/uploads/pengurus');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `pengurus-${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// --- Multer setup for proker photo uploads ---
const prokerUploadsDir = path.join(__dirname, 'public/uploads/proker');
if (!fs.existsSync(prokerUploadsDir)) fs.mkdirSync(prokerUploadsDir, { recursive: true });

const prokerStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, prokerUploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `proker-${Date.now()}${ext}`);
    }
});
const uploadProker = multer({
    storage: prokerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'osis-secret-key-1234',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Auth Middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    db.all("SELECT * FROM proker ORDER BY tanggal_pelaksanaan ASC LIMIT 6", [], (err, prokers) => {
        if (err) {
            console.error(err.message);
            prokers = [];
        }
        res.render('index', {
            title: 'OSIS SMA DIRA',
            prokers: prokers
        });
    });
});

app.get('/struktur', (req, res) => {
    db.all("SELECT * FROM pengurus ORDER BY id ASC", [], (err, pengurus) => {
        if (err) {
            console.error(err.message);
            pengurus = [];
        }
        res.render('struktur', {
            title: 'Struktur Organisasi - OSIS SMA DIRA',
            pengurus: pengurus
        });
    });
});

app.get('/agenda', (req, res) => {
    db.all("SELECT * FROM proker ORDER BY tanggal_pelaksanaan ASC", [], (err, prokers) => {
        if (err) {
            console.error(err.message);
            prokers = [];
        }
        res.render('agenda', {
            title: 'Semua Agenda - OSIS SMA DIRA',
            prokers: prokers
        });
    });
});

app.get('/agenda/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM proker WHERE id = ?", [id], (err, proker) => {
        if (err || !proker) {
            console.error(err ? err.message : 'Proker not found');
            return res.redirect('/agenda');
        }

        // Fetch Next and Previous for navigation
        const prevQuery = "SELECT id, judul FROM proker WHERE (tanggal_pelaksanaan < ?) OR (tanggal_pelaksanaan = ? AND id < ?) ORDER BY tanggal_pelaksanaan DESC, id DESC LIMIT 1";
        const nextQuery = "SELECT id, judul FROM proker WHERE (tanggal_pelaksanaan > ?) OR (tanggal_pelaksanaan = ? AND id > ?) ORDER BY tanggal_pelaksanaan ASC, id ASC LIMIT 1";

        db.get(prevQuery, [proker.tanggal_pelaksanaan, proker.tanggal_pelaksanaan, proker.id], (err, prevProker) => {
            db.get(nextQuery, [proker.tanggal_pelaksanaan, proker.tanggal_pelaksanaan, proker.id], (err, nextProker) => {
                res.render('agenda-detail', {
                    title: proker.judul + ' - OSIS SMA DIRA',
                    proker: proker,
                    prevProker: prevProker || null,
                    nextProker: nextProker || null
                });
            });
        });
    });
});

// AUTH ROUTES
app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/admin');
    }
    // Set error from query parameter if it exists
    res.render('login', { title: 'Login Admin - OSIS SMA DIRA', error: req.query.error });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            console.error("Login error:", err.message);
            return res.redirect('/login?error=Terjadi kesalahan sistem');
        }
        if (!user) {
            return res.redirect('/login?error=Username atau password salah');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.redirect('/admin');
        } else {
            res.redirect('/login?error=Username atau password salah');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protect all admin routes
app.use('/admin', requireAuth);

// ADMIN ROUTES
app.get('/admin', (req, res) => {
    db.all("SELECT * FROM proker ORDER BY id DESC", [], (err, prokers) => {
        if (err) {
            console.error(err.message);
            prokers = [];
        }
        res.render('admin/index', {
            title: 'Manajemen Data Proker - OSIS SMA DIRA',
            prokers: prokers
        });
    });
});

app.post('/admin/proker', uploadProker.single('foto'), (req, res) => {
    const { judul, deskripsi, paragraf, tanggal_pelaksanaan } = req.body;
    const fotoPath = req.file ? `/uploads/proker/${req.file.filename}` : null;
    db.run("INSERT INTO proker (judul, deskripsi, paragraf, foto, tanggal_pelaksanaan) VALUES (?, ?, ?, ?, ?)",
        [judul, deskripsi, paragraf || null, fotoPath, tanggal_pelaksanaan], function (err) {
            if (err) {
                console.error("Error inserting proker:", err.message);
            }
            res.redirect('/admin');
        }
    );
});

app.post('/admin/proker/delete/:id', (req, res) => {
    const id = req.params.id;
    // Delete the associated photo file if it's a local upload
    db.get("SELECT foto FROM proker WHERE id = ?", [id], (err, row) => {
        if (row && row.foto && row.foto.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, 'public', row.foto);
            fs.unlink(oldPath, () => {});
        }
        db.run("DELETE FROM proker WHERE id = ?", id, function (err) {
            if (err) {
                console.error("Error deleting proker:", err.message);
            }
            res.redirect('/admin');
        });
    });
});

// ADMIN PENGURUS ROUTES
app.get('/admin/pengurus', (req, res) => {
    db.all("SELECT * FROM pengurus ORDER BY id ASC", [], (err, pengurus) => {
        if (err) {
            console.error(err.message);
            pengurus = [];
        }
        res.render('admin/pengurus/index', {
            title: 'Manajemen Anggota - OSIS SMA DIRA',
            pengurus: pengurus
        });
    });
});

app.post('/admin/pengurus', upload.single('photo'), (req, res) => {
    const { nama, divisi, jabatan, image, phone, instagram } = req.body;
    // Prefer uploaded file; fall back to URL field
    const imagePath = req.file ? `/uploads/pengurus/${req.file.filename}` : (image || null);
    db.run("INSERT INTO pengurus (nama, divisi, jabatan, image, phone, instagram) VALUES (?, ?, ?, ?, ?, ?)",
        [nama, divisi, jabatan, imagePath, phone || null, instagram || null], function (err) {
            if (err) {
                console.error("Error inserting pengurus:", err.message);
            }
            res.redirect('/admin/pengurus');
        }
    );
});

app.post('/admin/pengurus/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM pengurus WHERE id = ?", id, function (err) {
        if (err) {
            console.error("Error deleting pengurus:", err.message);
        }
        res.redirect('/admin/pengurus');
    });
});

// Start server
app.get('/admin/pengurus/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM pengurus WHERE id = ?", [id], (err, row) => {
        if (err || !row) {
            console.error(err ? err.message : "Pengurus not found");
            return res.redirect('/admin/pengurus');
        }
        res.render('admin/pengurus/edit', {
            title: 'Edit Anggota - OSIS SMA DIRA',
            pengurus: row
        });
    });
});

app.post('/admin/pengurus/edit/:id', upload.single('photo'), (req, res) => {
    const id = req.params.id;
    const { nama, divisi, jabatan, image, phone, instagram } = req.body;
    // If a new file was uploaded, use it and delete the old local file if present
    db.get("SELECT image FROM pengurus WHERE id = ?", [id], (err, row) => {
        let imagePath;
        if (req.file) {
            imagePath = `/uploads/pengurus/${req.file.filename}`;
            // Remove old uploaded file if it was local
            if (row && row.image && row.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, 'public', row.image);
                fs.unlink(oldPath, () => {});
            }
        } else {
            // Keep existing image if URL field is blank, otherwise use URL field
            imagePath = image || (row ? row.image : null);
        }
        db.run("UPDATE pengurus SET nama = ?, divisi = ?, jabatan = ?, image = ?, phone = ?, instagram = ? WHERE id = ?",
            [nama, divisi, jabatan, imagePath, phone || null, instagram || null, id], function (err) {
                if (err) {
                    console.error("Error updating pengurus:", err.message);
                }
                res.redirect('/admin/pengurus');
            }
        );
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
