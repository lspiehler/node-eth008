const http = require('http');
var opened = false;
var cachevalid = false;
var ip = '192.168.0.200';
var port = 17494;
var username = 'admin';
var password = 'password';
var relaypositions = [0, 0, 0, 0, 0, 0, 0, 0];
var options = {
    host: ip,
    port: port,
    path: '/io.cgi',
    method: 'GET',
    headers: {
        'Authorization': 'Basic ' + new Buffer.from(username + ':' + password).toString('base64')
    }
}

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

var request = function(params, callback) {
    var data = [];
    options.path = params.path;

    var req = http.request(options, function(res) {

        res.on('data', function(chunk) {
            data.push(chunk);
        });

        res.on('end', function(){
            let responsebody = JSON.parse(new Buffer.concat(data).toString());
            let response = {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers,
                data: responsebody
            }
            if(response.error_message) {
                callback(response.error_message, response);
            } else {
                callback(false, response);
            }
        });

        res.on('error', function(e){
            callback(e, false);
        });
    });

    if(params.body) {
        req.write(JSON.stringify(params.body));
    } else {
        //req.write();
    }

    req.end();
}

var setRelayPosition = function(params, callback) {
    let path = '/io.cgi?DOA2=0';

    request({path: path, body: body}, function(err, resp) {
        if(err) {
            callback(err, false);
        } else {
            if(resp.statusCode==200) {

            } else {
                callback(true, resp);
            }
        }
    });
}

var writeRelayPosition = function(params, callback) {
    if(validRelay(params.relay)) {
        if(validPosition(params.position)) {
            let path = '/io.cgi?DOA2=0';

            request({path: path}, function(err, resp) {
                if(err) {
                    console.trace(err);
                    callback(err);
                } else {
                    if(resp.statusCode==200) {
                        console.trace(err);
                        callback(err);
                    } else {
                        relaypositions[params.relay - 1] = params.position;
                        //console.log('Relay:' + (params.relay - 1));
                        //console.log('Position: ' + params.position);
                        //console.log(relaypositions);
                        callback(false);
                    }
                }
            });
        } else {
            callback('Invalid position specified');
        }
    } else {
        callback('Invalid relay specified');
    }
}

var eth008 = function(options) {

    if(options) {
        if(options.ip) {
            ip = options.ip
        }
        if(options.port) {
            port = options.port
        }
        if(options.username) {
            username = options.username
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

let board = new eth008();
board.setRelayPosition({relay: 4, position: 1}, function(err) {
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