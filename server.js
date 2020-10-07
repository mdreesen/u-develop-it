const express = require('express');
// importing sqlite3, .verbose() is to produce messages in the terminal regarding the state of the runtime
const db = require('./db/database');
const apiRoutes = require('./routes/apiRoutes');

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', apiRoutes); // using the api routes

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