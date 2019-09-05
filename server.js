const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

const server = app.listen(PORT, () => console.log('Server started at port: ', PORT));
const io = socket(server);

app.post('/api/adduser', (req, res) => {
    const newUser = {
        id: req.body.id,
        name: req.body.name,
        location: req.body.location
    };

    io.emit('adduser', newUser);
    res.send(newUser);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});
