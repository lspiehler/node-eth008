var net = require('net');
var connected = false;
var connecting = false;
var cachevalid = false;
var relaypositions = [0, 0, 0, 0, 0, 0, 0, 0];
var client;
var authenticated = false;

var validRelay = function(relay) {
    //console.log(relay);
    if(Number.isInteger(relay)) {
        if(relay > 0 && relay < 9) {
            return true;
        } else {
            false;
        }
    } else {
        return false;
    }
}

var validPosition = function(position) {
    if(position===0 || position===1) {
        return true;
    } else {
        false;
    }
}

var connectBoard = function(callback) {
    client = new net.Socket();

    client.connect(port, ip, function() {
        connecting = true;
        console.log('Connecting');
    });

    client.on('close', function() {
        console.log('Connection closed');
        connected = false;
    });

    client.on('error', function(err) {
        console.log(err);
    });

    client.on('connect', function() {
        connected = true;
        connecting = false;
        callback(false);
    });
}

var authenticateBoard = function(callback) {
    let data = [121, 112, 97, 115, 115, 119, 111, 114, 100]
    //console.log(new Buffer.from(data));
    client.write(new Buffer.from(data));

    let response = client.on('data', function(data) {
        console.log('Auth response');
        console.log(data);
        //console.log(new Buffer.from([1]));
        if(data[0]==1) {
            authenticated = true
            callback(false);
            response = null;
        } else {
            callback('Authentication failure');
            response = null;
        }
        //client.destroy(); // kill client after server's response
    });
}

var authTimer = function() {
    setTimeout(function() {
        authenticated = false;
    }, 25000);
}

var prepConnection = function(callback) {
    console.log('called');
    if(connected) {
        if(authenticated) {
            callback(false);
        } else {
            authenticateBoard(function(err) {
                if(err) {
                    callback(err);
                } else {
                    //callback(false);
                    prepConnection(callback);
                }
            });
        }
    } else {
        connectBoard(function(err) {
            if(err) {
                callback(err);
            } else {
                prepConnection(callback);
            }
        })
    }
}

var writeRelayPosition = function() {
    //let data = [33, 2, 0]
    prepConnection(function(err) {
        if(err) {
            console.log(err);
        } else {
            let data = [35, 0, 0]
            client.write(new Buffer.from(data));

            client.on('data', function(data) {
                console.log('Relay command response');
                console.log(data);
            });
        }
    });
    /*setTimeout(function() {
        let data = [32, 2, 0]
        client.write(new Buffer.from(data));
    }, 1000);*/
}

var eth008 = function(options) {

    if(options) {
        if(options.ip) {
            ip = options.ip
        }
        if(options.port) {
            port = options.port
        }
        if(options.password) {
            password = options.password
            
        }
    }

    this.setRelayPosition = function(params, callback) {
        writeRelayPosition({relay: params.relay, position: params.position}, function(err) {
            if(err) {
                callback(err);
            } else {
                callback(false);
            }
        });
    }
}

let board = new eth008({ip: '192.168.0.200', port: 17494, password: 'password'});
board.setRelayPosition({relay: 2, position: 1}, function(err) {
    if(err) {

    } else {

    }
});

/*module.exports = {
    setRelayPosition: function(params, callback) {
        setRelayPosition(params, function(err) {
            if(err) {
                callback(err);
            } else {
                callback(false);
            }
        });
    },
    getRelayPositions: function(callback) {
        getRelayPositions(function(err, data) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, data);
            }
        });
    },
    startRelayDemo: function() {
        relayDemo({relay: 1, position: 0}, function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
}*/