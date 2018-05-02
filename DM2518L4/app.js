
// A Painter application that uses MQTT to distribute draw events
// to all other devices running this app.

/* global Paho device */

var app = {}

var host = 'mqtt.evothings.com'
var port = 1884

var messageBoard;
var inputBoard;
var connectButton;
var sendButton;
var nickname;


app.connected = false
app.ready = false


app.uuid = getUUID()

function getUUID () {
    if (window.isCordovaApp) {
        var uuid = device.uuid
        if ((uuid.length) > 16) {
            // On iOS we get a uuid that is too long, strip it down to 16
            uuid = uuid.substring(uuid.length - 16, uuid.length)
        }
        return uuid
    } else {
        return guid()
    }
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid () {
    function _p8 (s) {
        var p = (Math.random().toString(16) + '000000000').substr(2, 8)
        return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p
    }
    return _p8() + _p8(true) + _p8(true) + _p8()
}

/*
// Simple function to generate a color from the device UUID
app.generateColor = function (uuid) {
  var code = parseInt(uuid.split('-')[0], 16)
  var blue = (code >> 16) & 31
  var green = (code >> 21) & 31
  var red = (code >> 27) & 31
  return 'rgb(' + (red << 3) + ',' + (green << 3) + ',' + (blue << 3) + ')'
}
*/

app.initialize = function () {
    document.addEventListener(
        'deviceready',
        app.onReady,
        false)
}

app.onReady = function () {
    if (!app.ready) {
        //app.color = app.generateColor(app.uuid) // Generate our own color from UUID
        app.pubTopic = 'virrepinnen/' + app.uuid + '/evt' // We publish to our own device topic
        app.subTopic = 'virrepinnen/+/evt' // We subscribe to all devices using "+" wildcard
        app.setupMessageBoard()
        app.setupInputBoard()
        app.setupButtons()
        app.ready = true
    }
}

app.setupMessageBoard = function () {
    // disable the background textarea
    messageBoard = document.getElementById('message-background');
    messageBoard.readOnly = true;
}

app.setupInputBoard = function() {
    inputBoard = document.getElementById('input-board');
}

app.clearInputBoard = function() {
    inputBoard.value = '';
}

app.setupButtons = function() {
    connectButton = document.getElementById('connect');
    sendButton = document.getElementById('send');

    /* disable sendButton before connection */
    sendButton.disabled = true;

    // Add addEventListeners
    connectButton.addEventListener("click", function(){
        var name = inputBoard.value;
        if(name !== '') {
            nickname = name.trim();
            app.setupConnection();
            app.clearInputBoard();
            connectButton.disabled = true;
            sendButton.disabled = false;
        }
    });

    sendButton.addEventListener("click", function(){
        if(sendButton.disabled !== true) {
            var text = inputBoard.value;
            if(text !== '') {
                var msg = {};
                msg.name = nickname;
                msg.text = text.trim();
                app.sendMessage(msg);
                app.clearInputBoard();
            }
        }
    });

    app.log("Type your name, then connect.")
}

app.sendMessage = function(msg) {
    if(app.connected) {
        var json = JSON.stringify({ name: msg.name, text: msg.text});
        var message = new Paho.MQTT.Message(json)
        message.destinationName = app.pubTopic
        app.client.send(message)
    } else {
        app.log("You are not connected. Connect again.")
    }
}

app.displayMessage = function(msg) {
    messageBoard.value += msg.name + ": " + msg.text + "\n";
}



app.setupConnection = function () {
    app.client = new Paho.MQTT.Client(host, port, app.uuid)
    app.client.onConnectionLost = app.onConnectionLost
    app.client.onMessageArrived = app.onMessageArrived
    var options = {
        useSSL: true,
        onSuccess: app.onConnect,
        onFailure: app.onConnectFailure
    }
    app.client.connect(options)
}

app.subscribe = function () {
    app.client.subscribe(app.subTopic)
    console.log('Subscribed: ' + app.subTopic)
}

app.unsubscribe = function () {
    app.client.unsubscribe(app.subTopic)
    console.log('Unsubscribed: ' + app.subTopic)
}

app.onMessageArrived = function (message) {
    var o = JSON.parse(message.payloadString);
    var msg = {};
    msg.name = o.name;
    msg.text = o.text;
    app.displayMessage(msg);
    console.log("From: " + o.name + ", msg: " + o.text)
}

app.onConnect = function (context) {
    app.subscribe()
    app.log("Connected as "+nickname);
    app.connected = true
}

app.onConnectFailure = function (e) {
    console.log('Failed to connect: ' + JSON.stringify(e))
}

app.onConnectionLost = function (responseObject) {
    console.log('Connection lost: ' + responseObject.errorMessage)
    app.connected = false
}

/* Log messaging */
app.log = function(text) {
    var msg = {};
    msg.name = "Log";
    msg.text = text;
    app.displayMessage(msg);
}

app.initialize()
