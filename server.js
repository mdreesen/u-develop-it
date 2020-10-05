const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Testing the connection to the db
/*
app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});
*/

// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});


// listening
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});