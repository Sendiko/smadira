const express = require('express');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// ADMIN ROUTES
app.get('/admin', (req, res) => {
    db.all("SELECT * FROM proker ORDER BY id DESC", [], (err, prokers) => {
        if (err) {
            console.error(err.message);
            prokers = [];
        }
        res.render('admin', {
            title: 'Manajemen Data Proker - OSIS SMA DIRA',
            prokers: prokers
        });
    });
});

app.post('/admin/proker', (req, res) => {
    const { judul, deskripsi, tanggal_pelaksanaan } = req.body;
    db.run("INSERT INTO proker (judul, deskripsi, tanggal_pelaksanaan) VALUES (?, ?, ?)",
        [judul, deskripsi, tanggal_pelaksanaan], function (err) {
            if (err) {
                console.error("Error inserting proker:", err.message);
            }
            res.redirect('/admin');
        }
    );
});

app.post('/admin/proker/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM proker WHERE id = ?", id, function (err) {
        if (err) {
            console.error("Error deleting proker:", err.message);
        }
        res.redirect('/admin');
    });
});

// ADMIN PENGURUS ROUTES
app.get('/admin/pengurus', (req, res) => {
    db.all("SELECT * FROM pengurus ORDER BY id DESC", [], (err, pengurus) => {
        if (err) {
            console.error(err.message);
            pengurus = [];
        }
        res.render('admin_pengurus', {
            title: 'Manajemen Anggota - OSIS SMA DIRA',
            pengurus: pengurus
        });
    });
});

app.post('/admin/pengurus', (req, res) => {
    const { nama, divisi, jabatan } = req.body;
    db.run("INSERT INTO pengurus (nama, divisi, jabatan) VALUES (?, ?, ?)",
        [nama, divisi, jabatan], function (err) {
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
        res.render('admin_pengurus_edit', {
            title: 'Edit Anggota - OSIS SMA DIRA',
            pengurus: row
        });
    });
});

app.post('/admin/pengurus/edit/:id', (req, res) => {
    const id = req.params.id;
    const { nama, divisi, jabatan } = req.body;
    db.run("UPDATE pengurus SET nama = ?, divisi = ?, jabatan = ? WHERE id = ?",
        [nama, divisi, jabatan, id], function (err) {
            if (err) {
                console.error("Error updating pengurus:", err.message);
            }
            res.redirect('/admin/pengurus');
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
