const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'ansel',
    password: 'ansel',
    database: 'spotify_ginawa'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Add new song
app.post('/add-song', upload.single('file'), (req, res) => {
    console.log(req.body); // Log the body of the request
    console.log(req.file);  // Log the file information

    const { title, artist, album, genre } = req.body;
    const url = `http://localhost:3000/uploads/${req.file.filename}`;

    const query = 'INSERT INTO songs(title, artist, album, genre, url) VALUES(?,?,?,?,?)';
    db.query(query, [title, artist, album, genre, url], (err, result) => {
        if (err) throw err;
        res.status(201).send({ message: 'Song added successfully!' });
    });
});

// Endpoint to get all songs
app.get('/songs', (req, res) => {
    const query = 'SELECT * FROM songs';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
// Endpoint to search songs
app.get('/search-songs', (req, res) => {
    const { query } = req.query; // Get the search query from request
    const sqlQuery = `
        SELECT * FROM songs
        WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
    `;
    const searchQuery = `%${query}%`; // Use wildcards for searching
    db.query(sqlQuery, [searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// Other routes remain unchanged...

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
