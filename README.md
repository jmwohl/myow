# myow

Myow (probably pronounced meow) is a simple commandline tool used to hook up the [Myo armband](https://www.myo.com/) as an input to [Wekinator](http://www.wekinator.org/).

There is nothing complicated going on here. Wekintor expects incoming data on a specified OSC port. The Myo broadcasts websocket events with data from its sensors. Myow simply listens for the websocket data using [myo.js](https://github.com/thalmiclabs/myo.js) and translates them to the appropriate OSC messages using [osc.js](https://github.com/colinbdclark/osc.js).

### Installation

Install the package globally via npm:

```
$ npm install -g myow
```

### Usage

>Note: myow requires Myo Connect to be running.

Look at the help output: 

```
$ myow --help

  Usage: myow [options] [input]

  Send data from Myo to Wekinator.

  Input value can be one of [accelerometer|orientation|gyroscope|emg|imu] (default: imu)

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    --inport [n]       The port on which to receive OSC data (default: 12000)
    --outport [n]      The port on which to send OSC data (default: 6448
    --inhost [value]   The host on which to receive OSC data (default: 127.0.0.1)
    --outhost [value]  The host on which to send OSC data (default: 127.0.0.1)
    -l, --log          Log osc in/out to console.
    --login            Log osc input only to console.
    --logout           Log osc output only to console.
```

The [input] value lets us specify what stream of data to pass along to Wekinator. By default, it will use `imu`, which is a 10-dimensional vector composed of accelerometer, gyroscope, and orientation data. You can narrow down that data stream by specifying `accelerometer`, `gyroscope`, or `orientation` as the input. If you wish to use raw 8-dimensional EMG data, use `emg` as the input.

If you're not using the default hosts/ports in Wekinator, you can use the optional arguments to set custom values.

### Examples

Start sending OSC messages containing all imu (inertial measurement unit) data to `/wek/inputs` using the default ports with no input/output logging:

```
$ myow
```

The imu data looks like: `[ -0.52392578125, -0.0126953125, 0.76611328125, 8.1875, 81.1875, 3.0625, 0.59625244140625, -0.19793701171875, 0.16851806640625, 0.75946044921875 ]`

Maybe we only want to use orientation data and log all OSC messages:

```
$myow orientation -l
```

Then we'll be sending only the last four elements of the imu data along: `[0.59625244140625, -0.19793701171875, 0.16851806640625, 0.75946044921875 ]`

#### Logging OSC messages

It can be helpful to inspect the stream of messages that are being sent and received via OSC. You can use `--login`, `--logout`, and `-l` to view input, output, and both message types, respectively.

```
$ myow orientation -l
```


