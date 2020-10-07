const express = require('express');
// importing sqlite3, .verbose() is to produce messages in the terminal regarding the state of the runtime
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connect to SQLite database
// created a new db object and connects to the db
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the election database.')
});

// All candidates statement
//the db object is using the all() method
//this method runs the sql query and executes the callback with all the resulting rows that match the query
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});


// Single candidate statement
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
    AS party_name
    FROM candidates
    LEFT JOIN parties 
    ON candidates.party_id = parties.id
    WHERE candidates.id = ?`
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

/*db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
    if (err) {
        console.log(err);
    }
    console.log(row);
})
*/

// Gets all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Gets individual party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// Deletes the party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({ message: 'successfully deleted', changes: this.changes });
    });
});

/*
The result value is undefined. This was expected because run() doesn't return any result data.
this is shown to be the Statement object, which has three properties:
The SQL statement executed is sql.
The primary key id that was inserted is lastID, or 0 if there was no insertion.
The number of rows changed is changes.
We'll keep the this.changes value to verify whether the SQL query made changes to the candidates table.
*/

// Delete candidate
app.delete('/api/candidates/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id]
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }
        res.json({
            message: 'successfully deleted',
            // this will verify if any rows have changed
            changes: this.changes
        });
    });
});

// Updates the candidate
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});


// Adds information back in
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                 VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use 'this'
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body,
            id: this.lastId
        });
    });
});

/* We made a few changes to this statement to account for the length of this SQL query.
The SQL command and the SQL parameters were assigned to the sql and params variables respectively to improve the legibility for the call function to the database.
In the SQL command we use the INSERT INTO command for the candidates table to add the values that are assigned to params.
The four placeholders must match the four values in params, so we must use an array.
In the response, we'll log the this.lastID to display the id of the added candidate.
*/

/*
const sql = `INSERT INTO CANDIDATES (id, first_name, last_name, industry_connected)
            VALUES (?,?,?,?)`;
const params = [1, 'Ronald', 'Firbank', 1];
// ES5 function, not arrow function, to use this
db.run(sql, params, function(err, result) {
    if (err) {
        console.log(err)
    }
    console.log(result, this.lastID);
});
*/



// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});


// listening
// created the .on when we connect to the db first, then listen for express
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});