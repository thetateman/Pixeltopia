"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const { WebSocketServer, WebSocket } = require('ws');
const rateLimit = require("ws-rate-limit");


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

let board = [];
for(let i = 0; i < 100; i++){
    board.push([]);
    for(let j = 0; j < 60; j++){
        board[i].push("");
    }
}
app.use("/board", async (req, res)=>{
    res.json(board);
  });

const server = http.createServer(app);
let wss = new WebSocketServer({server, maxPayload: 1024 * 4});
const wsClients = {};
const wsSubscribers = {
  newToken: [],
  local: []
};

let myRateLimit = rateLimit("1s", 8);
function heartbeat() {
  this.isAlive = true;
}
let addressToClientMap = {};
let rateLimitOffenses = {};
let rateLimitMsgSizeOffenses = {};
wss.on('connection', function connection(ws, req){
    console.log("connected")
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    ws.ip_address = ip;
    if(!addressToClientMap.hasOwnProperty(ip)){
      addressToClientMap[ip] = 0;
    }
    addressToClientMap[ip]++;
    if(addressToClientMap[ip] > 3){
      addressToClientMap[ip]--;
      console.log("too many ws connections" + ip);
      if(!rateLimitOffenses.hasOwnProperty(ip)){
        rateLimitOffenses[ip] = 0;
      }
      rateLimitOffenses[ip]++;
      if (rateLimitOffenses[ip] > 15){
        banIP(ip);
      } else {
          setTimeout(()=>{
            if(rateLimitOffenses[ip] > 0){
              rateLimitOffenses[ip]--;
            }
          }, 1000 * 60 * 15);
      }
      ws.terminate();
      return;
    } else {
      // setTimeout(()=>{
      //   if(addressToClientMap[ip] > 0){
      //     addressToClientMap[ip]--;
      //   }
      // }, 1000 * 60 * 5);
    }
    myRateLimit(ws);
    ws.on('limited', data => {
      console.log("limited" + ip);
    })
    ws.on('pong', heartbeat);
    ws.id = crypto.randomUUID();
    wsClients[ws.id] = ws;
    ws.on('error', (e)=>{
      console.error(`WS message exceeded max size. IP: ${ws.ip_address} Time: ${Date.now()}`);
      if(!rateLimitMsgSizeOffenses.hasOwnProperty(ws.ip_address)){
        rateLimitMsgSizeOffenses[ws.ip_address] = 0;
      }
      rateLimitMsgSizeOffenses[ws.ip_address]++;
      if (rateLimitMsgSizeOffenses[ws.ip_address] > 35){
        banIP(ws.ip_address);
      }
    });
    ws.on('close', function close(message){
      if(addressToClientMap[ip] > 0){
        addressToClientMap[ip]--;
      }
    })
    ws.on('message', function message(data, isBinary){
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
            }
        });
      const message = isBinary ? data : data.toString();
      const pixelClicked = JSON.parse(message);
      //console.log(message);
      board[pixelClicked.x][pixelClicked.y] = pixelClicked.color;
    })
  });
  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        let ip = ws.ip_address;
        if(addressToClientMap[ip] > 0){
          addressToClientMap[ip]--;
        }
        return ws.terminate()
      };
  
      ws.isAlive = false;
      ws.ping();
    });
  }, 25000);
  
  wss.on('close', function close() {
    clearInterval(interval);
  });



server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('server started');
});