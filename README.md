doppio-demo
===========

Demo of the Doppio Runtime System.

Prerequisites: Clone [DoppioJVM](https://github.com/plasma-umass/doppio) somewhere, build it, and `npm link` it.

To build the demo, run:

    npm install
    npm link doppiojvm
    grunt

Serve the demo direct from the `build/` directory:

    cd build
    http-server  # or any other file server

Or copy the `build` directory's contents to the desired location on your webserver.
