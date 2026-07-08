const express = require('express');
const mysql = require('mysql2');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Parses form data

// Database Connection (Use environment variables for deployment later)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password', // Change to your MariaDB password
    database: 'adult_swim_db'
});

// ==========================================
// 1. READ: Display all data records
// ==========================================
app.get('/classes', (req, res) => {
    const query = 'SELECT * FROM Classes';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { classes: results });
    });
});

// ==========================================
// 2. SEARCH: Filter by at least TWO criteria
// ==========================================
app.get('/classes/search', (req, res) => {
    const { level, maxPrice } = req.query;
    // SQL Requirement: SELECT with 2 filtering criteria
    const query = 'SELECT * FROM Classes WHERE difficulty_level = ? AND price <= ?';
    
    db.query(query, [level, maxPrice], (err, results) => {
        if (err) throw err;
        res.render('index', { classes: results });
    });
});

// ==========================================
// 3. CREATE: Display form & Process form
// ==========================================
app.get('/classes/new', (req, res) => {
    res.render('create');
});

app.post('/classes', (req, res) => {
    const { title, description, difficulty_level, price, instructor_id } = req.body;
    // SQL Requirement: INSERT INTO
    const query = 'INSERT INTO Classes (title, description, difficulty_level, price, instructor_id) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [title, description, difficulty_level, price, instructor_id], (err) => {
        if (err) throw err;
        res.redirect('/classes');
    });
});

// ==========================================
// 4. UPDATE: Display form & Process form
// ==========================================
app.get('/classes/:id/edit', (req, res) => {
    const query = 'SELECT * FROM Classes WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('edit', { swimClass: results[0] });
    });
});

app.post('/classes/:id/edit', (req, res) => {
    const { title, description, difficulty_level, price } = req.body;
    // SQL Requirement: UPDATE
    const query = 'UPDATE Classes SET title = ?, description = ?, difficulty_level = ?, price = ? WHERE id = ?';
    
    db.query(query, [title, description, difficulty_level, price, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/classes');
    });
});

// ==========================================
// 5. DELETE: Display confirmation & Delete
// ==========================================
app.get('/classes/:id/delete', (req, res) => {
    const query = 'SELECT * FROM Classes WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('deleteConfirm', { swimClass: results[0] });
    });
});

app.post('/classes/:id/delete', (req, res) => {
    // SQL Requirement: DELETE
    const query = 'DELETE FROM Classes WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/classes');
    });
});

// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));