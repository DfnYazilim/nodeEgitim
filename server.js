var express = require('express')
var app = express();
app.use( express.static( 'clientFile' ) );

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

let server = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.1.81:9100',
    characterSet : ""
});
async function yazdir(yazi)  {
    var date = new Date();
    var current_day = date.getDate();
    var current_month = date.getUTCMonth() + 1;
    var current_year = date.getFullYear();
    var current_hour = date.getHours();
    var current_min = date.getMinutes();

    server.alignCenter();
    await server.printImage("Clipboard.png");
    server.newLine();
    server.newLine();
    server.bold(true);
    server.setTextSize(1,1);
    server.alignRight();
    server.println(yazi[0].cafeTableName);
    server.println(current_day + "." + current_month  + "."+current_year);
    server.println(current_hour + ":" + current_min);
    server.alignLeft();
    server.bold(false);
    server.setTextSize(0,0);
    server.drawLine();

    yazi.forEach(function (item) {
        server.println(item.productName + " - " + item.count + " Adet");
        if(item.description != null){
            server.println(item.description);
        }
        server.drawLine();

    })

    // printer.printImage('logob.png')
    server.cut();

    try {
        let execute = server.execute()
        console.error("Print done!");
    } catch (error) {
        console.log("Print failed:", error);
    }
}


var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // yazdir();
            if(JSON.parse(message.utf8Data).messageType === 1){
            var siparisler = JSON.parse(message.utf8Data);
            yazdir( siparisler.message);
            // siparisler.message.forEach(function (item) {
            //     yazdir(item.productId + " - " + item.count);
            // })
                // yazdir(siparisler.message[0].productId);
            }
            // console.log("Gelen veri: '" + JSON.parse(message.utf8Data).requestedNickname + "'");
            console.log("Gelen veri: '" + (message.utf8Data) + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    // sendNumber();
});

// client.connect('ws://212.156.147.70:4545/chat');
client.connect('ws://192.168.1.102:5001/printer');
