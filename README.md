# myow

Myow is a simple commandline tool used to hook up the [Myo armband](https://www.myo.com/) as an input to [Wekinator](http://www.wekinator.org/).

Myow translates incoming Myo data via websockets to osc messages ready for processing by Wekinator.

![Computer Cat](http://i.giphy.com/JIX9t2j0ZTN9S.gif)

### Installation

Install the package globally via npm:

```
$ npm install -g myow
```

### Usage

>Note: myow requires Myo Connect to be running.

Let's look at the help output: 

```
$ myow --help

Usage: myow [options] [input]

  Send data from Myo to Wekinator.
  Input value can be one of [accelerometer|orientation|gyroscope|emg|imu] (default: imu)

  Options:

    -h, --help         output usage information
    --inport [n]       The port on which to receive OSC data (default: 12000)
    --outport [n]      The port on which to send OSC data (default: 6448
    --inhost [value]   The host on which to receive OSC data (default: 127.0.0.1)
    --outhost [value]  The host on which to send OSC data (default: 127.0.0.1)
```

As we can see, the [input] value lets us specify what stream of data to pass along to Wekinator. By default, it will use `imu`, which is a 10-dimensional vector composed of accelerometer, gyroscope, and orientation data. If you wish to use raw 8-dimensional EMG data, use `emg` as the input.

If you're not using the default hosts/ports in Wekinator, you can use the optional arguments to set custom values.