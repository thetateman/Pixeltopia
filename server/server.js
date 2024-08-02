"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');


const app = express();

// Security middleware
app.set('trust proxy', 'loopback');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        connectSrc: ["'self'", "wss://pixeltopia.fun"], //TODO: Replace
    },
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));



//app.use("/api", apiRouter);
app.get("/robots.txt", (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../robots.txt`));
});


app.use(express.static(path.resolve(`${__dirname}/../client`), {index: 'index.html'}));

/*

app.use('/login', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/login.html`));
});
app.use('/lobby', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/lobby.html`));
});
app.use('/about', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/about.html`));
});
app.use('/game', (req, res) => {
    let requestedGameID = req.query.gameid;
    res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
});
*/

const server = http.createServer(app);



server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('server started');
});