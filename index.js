var net = require('net');
var relaypositions = [];
var ip;
var port;
var password;

var validRelay = function(relay) {
    //console.log(relay);
    if(Number.isInteger(relay)) {
        if(relay >= 0 && relay < 9) {
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

var setRelayPosition = function(params, callback) {
    var cmd;
    var request;
    var authenticating = false;
    if(validRelay(params.relay)) {
        if(validPosition(params.position)) {
            if(params.relay==0) {
                if(params.position==0) {
                    cmd = 0
                } else {
                    cmd = 255
                }
                request = [35, cmd, 0];
            } else {
                if(params.position==0) {
                    cmd = 33
                } else {
                    cmd = 32
                }
                request = [cmd, params.relay, 0];
            }
        } else {
            callback('Invalid position requested');
            return;
        }
    } else {
        callback('Invalid relay requested')
        return;
    }
    let client = new net.Socket();

    client.connect(port, ip, function() {
        
    });

    client.on('close', function() {
        //console.log('Connection closed');
    });

    client.on('error', function(err) {
        callback(err);
        client.end();
    });

    client.on('connect', function() {
        authenticating = true;
        let data = getAuthData(password);
        //console.log(new Buffer.from(data));
        client.write(new Buffer.from(data));
    });

    client.on('data', function(data) {
        //console.log('Relay response');
        //console.log(data);
        if(authenticating) {
            //console.log(new Buffer.from([1]));
            if(data[0]==1) {
                authenticating = false;
                client.write(new Buffer.from(request));
            } else {
                callback('Authentication failure');
                client.end();
            }
        } else {
            if(data[0]==0) {
                //if relaypositions cache is initialized, update it
                if(relaypositions.length > 0) {
                    if(params.relay==0) {
                        for(let i = 0; i <= relaypositions.length - 1; i++) {
                            relaypositions[i] = params.position
                        }
                    } else {
                        relaypositions[params.relay - 1] = params.position;
                    }
                }
                callback(false);
            } else {
                callback('Unknown error');
            }
            client.end();
        }
    });
}

var getAuthData = function(password) {
    var pass = [121];
    for(let i = 0; i <= password.length - 1; i++) {
        pass.push(password[i].charCodeAt(0));
    }
    return pass;
}

var getRelayPositions = function(callback) {
    if(relaypositions.length <= 0) {
        var authenticating = false;
        let client = new net.Socket();

        client.connect(port, ip, function() {
            
        });

        client.on('close', function() {
            //console.log('Connection closed');
        });

        client.on('error', function(err) {
            callback(err, false);
            client.end();
        });

        client.on('connect', function() {
            authenticating = true;
            //let data = [121, 112, 97, 115, 115, 119, 111, 114, 100]
            let data = getAuthData(password);
            //console.log(new Buffer.from(data));
            client.write(new Buffer.from(data));
        });

        client.on('data', function(data) {
            //console.log('Relay response');
            //console.log(data);
            if(authenticating) {
                //console.log(new Buffer.from([1]));
                if(data[0]==1) {
                    authenticating = false;
                    let request = [36]
                    client.write(new Buffer.from(request));
                } else {
                    callback('Authentication failure', false);
                    client.end();
                }
            } else {
                let b = [];
                for (var i = 0; i < 8; i++) {
                    b[i] = (data[0] >> i) & 1;
                }
                relaypositions = b;
                callback(false, b);
                client.end();
            }
        });
    } else {
        callback(false, relaypositions);
    }

}

var relayDemo = function(params, callback) {
    console.log(relaypositions);
    setTimeout(function() {
        setRelayPosition({relay: params.relay, position: params.position}, function(err) {
            if(err) {
                callback(err);
            } else {
                callback(false);
            }
            let position;
            let relay;
            if(params.relay===8) {
                relay = 1;
                if(params.position===1) {
                    position = 0;
                } else {
                    position = 1;
                }
                getRelayPositions(function(err, data) {
                    if(err) {
                        callback(err);
                    } else {
                        //console.log(data);
                        callback(false);
                    }
                    relayDemo({relay: relay, position: position}, function(err) {
                        if(err) {
                            console.log(err)
                        }
                    });
                });
            } else {
                position = params.position;
                relay = params.relay + 1;
                relayDemo({relay: relay, position: position}, function(err) {
                    if(err) {
                        //console.log(err)
                    }
                });
            }
        });
    }, 100);
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
        setRelayPosition({relay: params.relay, position: params.position}, function(err) {
            if(err) {
                callback(err);
            } else {
                callback(false);
            }
        });
    }

    this.getRelayPositions = function(callback) {
        getRelayPositions(function(err, data) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, data);
            }
        });
    }

    this.startRelayDemo = function() {
        relayDemo({relay: 1, position: 0}, function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
}

module.exports = eth008;

/*let board = new eth008({ip: '192.168.0.200', port: 17494, password: 'password'});
board.setRelayPosition({relay: 0, position: 0}, function(err) {
    if(err) {
        console.log(err);
    } else {
        board.getRelayPositions(function(err, data) {
            console.log('done');
            if(err) {
                console.log(err);
            } else {
                console.log(data);
                board.startRelayDemo();
            }
        });
    }
});*/