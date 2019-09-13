const express = require('express');
const socket = require('socket.io');
const path = require('path');
const xssFilters = require('xss-filters');

const app = express();
const PORT = process.env.PORT || 3000;
let io = null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

app.post('/api/tracking/adduser', (req, res) => {
    const newUser = {
        id: xssFilters.inHTMLData(req.body.id),
        name: xssFilters.inHTMLData(req.body.name),
        location: req.body.location
    };

    io.emit('adduser', newUser);
    res.send(newUser);
});

app.post('/api/tracking/adduserlocation', (req, res) => {
    const user = {
        id: xssFilters.inHTMLData(req.body.id),
        name: xssFilters.inHTMLData(req.body.name),
        location: req.body.location
    };

    io.emit('adduserlocation', user);
    res.send(user);
});

app.post('/api/tracking/addusers', (req, res) => {
    const users = [];
    req.body.data.forEach((user) => {
        const newUser = {
            id: xssFilters.inHTMLData(user.id),
            name: xssFilters.inHTMLData(user.name),
            location: user.location
        };

        if (newUser.id && newUser.name && newUser.location.length > 0) {
            users.push(newUser);
        }
    });

    io.emit('addusers', users);
    res.send(users);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const server = app.listen(PORT, () => {
    console.log('Server started at port: ', PORT);
    io = socket(server);
});
