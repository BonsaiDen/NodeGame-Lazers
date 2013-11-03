// Dependencies ---------------------------------------------------------------
var express = require('express'),
    browserify = require('browserify-middleware'),
    http = require('http'),
    Server = require('./server/Server').Server;


// Server ---------------------------------------------------------------------
(function() {

    var app = express();
    app.server = http.createServer(app);

    browserify.settings.development('basedir', __dirname);

    app.use('/js', browserify('./client/js'));

    app.use(express.static(__dirname + '/client'));
    app.use(express.logger());

    app.game = new Server();
    app.game.listen(app.server);

    app.server.listen(4000);

    process.on('SIGINT', function() {
        app.game.stop();
        process.exit();
    });

})();

