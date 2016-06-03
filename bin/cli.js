#! /usr/bin/env node

var Myo = require('myo'),
    osc = require('osc'),
    program = require('commander'),
    debug = require('debug')('myow'),
    p = require('../package.json'),
    version = p.version.split('.').shift(),
    utils = require('../utils');

program
    .version(version)
    .command('myow')
    .description('Send data from Myo to Wekinator.\n  Input value can be one of [accelerometer|orientation|gyroscope|emg|imu] (default: imu)')
    .option('--inport [n]', 'The port on which to receive OSC data (default: 12000)', parseInt)
    .option('--outport [n]', 'The port on which to send OSC data (default: 6448', parseInt)
    .option('--inhost [value]', 'The host on which to receive OSC data (default: 127.0.0.1)')
    .option('--outhost [value]', 'The host on which to send OSC data (default: 127.0.0.1)')
    .arguments('[input]')
    .action(function (input) {
        program.input = input;
    })
    .parse(process.argv);

// Select the input stream based on commandline argument
switch(program.input) {
    case 'emg':
        initEmgStream();
        break;
    case 'gyroscope':
        initGyroscopeStream();
        break;
    case 'orientation':
        initOrientationStream();
        break;
    case 'accelerometer':
        initAccelerometerStream();
        break;
    default:
        // no (or unknown) input given, default to imu with all streams active
        initImuStream();
}


_setupOsc();
_setupMyo();

function _setupOsc () {
    // build config object
    var _opts = {
        // This is the port we're listening on, defaults to wekinator's default output port
        localAddress: program.inhost || '127.0.0.1',
        localPort: program.inport || 12000,

        // This is where we're sending osc messages, defaults to wekinator's input port
        remoteAddress: program.outhost || '127.0.0.1',
        remotePort: program.outport || 6448
    };

    debug(_opts);

    // Setup OSC
    var udpPort = new osc.UDPPort(_opts);

    // Open the socket.
    udpPort.open();

    // log any incomming message
    udpPort.on("message", function (oscMessage) {
        debug('OSC received: ', oscMessage);
    });
}


function _setupMyo() {
    // Setup Myo
    Myo.on('connected', function(){
        debug('Myo connected');
        this.streamEMG(true);
    })

    Myo.connect('com.wohllabs.myow');
}






function initEmgStream() {
    debug('Sending raw EMG data');
    Myo.on('emg', function(data){
        var msg = {
            address: "/wek/inputs",
            args: data
        };

        debug("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
        udpPort.send(msg);
    });
}

function initAccelerometerStream() {
    debug('Sending accelerometer data');
    initImuStream(true);
}

function initGyroscopeStream() {
    debug('Sending gyroscope data');
    initImuStream(false, true, false);
}

function initOrientationStream() {
    debug('Sending orientation data');
    initImuStream(false, false, true);
}

function initImuStream(accelerometer, gyroscope, orientation) {
    debug('Sending all imu data');
    // if called with no params, use all
    if (!accelerometer && !gyroscope && !orientation) {
        accelerometer = gyroscope = orientation = true;
    }

    Myo.on('imu', function(data) {
        // concatonate all imu streams
        var args = [];

        args = accelerometer ? args.concat(Object.values(data.accelerometer)) : args;
        args = orientation ? args.concat(Object.values(data.orientation)) : args;
        args = gyroscope ? args.concat(Object.values(data.gyroscope)) : args;

        var msg = {
            address: "/wek/inputs",
            args: args
        };

        debug("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
        udpPort.send(msg);
    });
}
