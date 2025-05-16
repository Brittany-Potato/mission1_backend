//Variables
const express = require('express');
const app = express();
const port = 4000;

const endpoint = process.env.CUSTOM_VISION_ENDPOINT;
const apikey = process.env.KEY;

//Code
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.post(endpoint, (req, res) => {
    const data = req.body;
    console.log(data);
    res.send('Data has been recieved');
});