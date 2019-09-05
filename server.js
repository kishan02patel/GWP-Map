const express = require('express');
const socket = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const server = app.listen(PORT, () => console.log('Server started at port: ', PORT));
const io = socket(server);

app.get('/', (req, res) => {
    res.send('Welcome to map visualization api');
});

app.post('/api/adduser', (req, res) => {
    const newUser = {
        id: req.body.id,
        name: req.body.name,
        location: req.body.location
    };

    io.emit('adduser', newUser);
    res.send(newUser);
});
