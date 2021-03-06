#! /usr/bin/env node

var Myo = require('myo'),
    osc = require('osc'),
    program = require('commander'),
    debug = require('debug')('myow'),
    p = require('../package.json'),
    version = p.version.split('.').shift(),
    utils = require('../utils'),
    udpPort;

program
    .version(version)
    .description('Send data from Myo to Wekinator.\n\n  Input value can be one of [accelerometer|orientation|gyroscope|emg|imu] (default: imu)')
    .option('--outhost [value]', 'The host on which to send OSC data (default: 127.0.0.1)')
    .option('--outport [n]', 'The port on which to send OSC data (default: 6448)', parseInt)
    .option('--inhost [value]', 'The host on which to receive OSC data, if --receive-osc argument is present (default: 127.0.0.1)')
    .option('--inport [n]', 'The port on which to receive OSC data, if --receive-osc argument is present (default: 12000)', parseInt)
    .option('-r, --receive-osc', 'If present, listen for OSC messages on --inport')
    .option('-l, --log', 'Log osc in/out to console.')
    .option('--login', 'Log osc input only to console.')
    .option('--logout', 'Log osc output only to console.')
    .arguments('[input]')
    .action(function (input) {
        program.input = input;
    })
    .parse(process.argv);

_setupOsc();
_setupMyo();

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

function _setupOsc () {
    // build config object
    var _opts = {
        // This is where we're sending osc messages, defaults to wekinator's input port
        remoteAddress: program.outhost || '127.0.0.1',
        remotePort: program.outport || 6448
    };

    // By default we won't listen for OSC messages so as not to interfere with Wekinator output
    // --receive-osc flag is useful for setup and debugging
    if (program.receiveOsc) {
        // This is the port we're listening on, defaults to wekinator's default output port
        _opts.localAddress = program.inhost || '127.0.0.1';
        _opts.localPort = program.inport || 12000;
    }

    debug(_opts);

    // Setup OSC
    udpPort = new osc.UDPPort(_opts);

    // Open the socket.
    udpPort.open();

    // log any incomming message
    udpPort.on("message", function (oscMessage) {
        debug('OSC received: ', oscMessage);
        if (program.log || program.login) {
            console.log('OSC received: ', oscMessage);
        }
    });

    console.log('\nOSC connected.');
    console.log('listening: ' + _opts.localAddress + ':' + _opts.localPort);
    console.log('sending: ' + _opts.remoteAddress + ':' + _opts.remotePort)
}

function _setupMyo() {
    Myo.on('connected', function() {
        console.log('\nMyo connected.');
        this.streamEMG(true);
    });

    Myo.on('disconnected', function() {
        console.log('\n Myo disconnected.');
        this.streamEMG(false);
    });

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
        if (program.log || program.logout) {
            console.log('OSC sent: ', msg);
        }
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
        args = gyroscope ? args.concat(Object.values(data.gyroscope)) : args;
        args = orientation ? args.concat(Object.values(data.orientation)) : args;

        var msg = {
            address: "/wek/inputs",
            args: args
        };

        debug("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
        if (program.log || program.logout) {
            console.log('OSC sent: ', msg);
        }
        udpPort.send(msg);
    });
}
