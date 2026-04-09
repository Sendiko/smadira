const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
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
        res.render('admin/pengurus/edit', {
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
