// Dependencies ---------------------------------------------------------------
var lithium = require('lithium'),
    BISON = require('bisonjs'),
    Class = require('../shared/Class').Class,
    HashList = require('../shared/HashList').HashList,
    Network = require('../shared/Network').Network,
    Loop = require('../shared/Loop').Loop,
    Map = require('../shared/Map').Map,
    Player = require('./Player').Player;


// Server ---------------------------------------------------------------------
var Server = Class(function() {

    this.loop = null;
    this.remotes = new HashList();
    this.players = new HashList();

    this.map = new Map(640, 480, [
        [
            320, 240,
            [100, -100, 100, 100, -100, 100, -100, -100]
        ],

        [
            0, 0,
            [0, 0, 100, 0, 0, 100]
        ]

    ]);

    this.config = {
        fps: 30
    };

    this.stats = {
        bytesSend: 0,
        bytesReceived: 0
    };

    this.server = new lithium.Server(
        this.onRemote.bind(this),
        BISON.encode,
        BISON.decode
    );

}, {

    // Actions ----------------------------------------------------------------
    listen: function(server) {
        this.log('Started');
        this.server.listen(server);
        this.loop = new Loop(this.config.fps, this.update, null, this);
        this.loop.start();
    },

    update: function(type, time, u) {

        if (type === Loop.Update.Normal) {
            this.players.each(function(player) {
                player.update(time, u);
            });

        } else if (type === Loop.Update.Final) {

            this.players.each(function(player) {
                this.server.send([
                    Network.Player.RemoteState,
                    player.serialize()
                ]);

            }, this);

        } else if(type === Loop.Update.Tick) {
            this.updateStats();
        }

    },

    updateStats: function() {

        this.stats.bytesSend = 0;
        this.stats.bytesReceived = 0;

        this.remotes.each(function(remote) {
            this.stats.bytesSend += remote.bytesSend;
            this.stats.bytesReceived += remote.bytesReceived;
            remote.bytesSend = 0;
            remote.bytesReceived = 0;

        }, this);

        this.server.send([Network.Server.Stats, this.stats]);

    },

    stop: function() {

        this.log('Stopped');
        this.players.each(function(player) {
            this.removePlayer(player);

        }, this);

        this.loop.stop();
        this.server.close();

    },


    // Events -----------------------------------------------------------------
    onRemote: function(remote) {

        remote.accept();
        remote.send([Network.Server.Config, this.config]);
        remote.send([Network.Server.Map, this.map.serialize()]);
        remote.send([Network.Server.Start]);

        remote.on('message', this.onMessage.bind(this, remote));
        remote.on('close', this.onClose.bind(this, remote));

        this.remotes.add(remote);

        this.log('Remote connected', remote.toString());

    },

    onMessage: function(remote, msg) {

        var type = msg[0],
            data = msg[1];

        // Validation
        if (!type || !(data instanceof Array)) {
           this.log('Invalid message', remote.toString(), msg);

        // Player Actions
        } else if (remote.player) {

            if (type === Network.Client.Observe) {
                this.removePlayer(remote.player);
                remote.player = null;

            } else {
                remote.player.onMessage(type, data);
            }

        // Server Actions
        } else if (type === Network.Client.Play) {

            // TODO validate usernames etc.
            remote.player = this.addPlayer(new Player(this, remote, data || {}));

            this.server.send([
                Network.Player.Meta,
                remote.player.serializeMeta()
            ]);

        } else {
           this.log('Remote message', remote.toString(), msg);
        }

    },

    onClose: function(remote) {

        if (remote.player) {
            remote.player.onClose();
            remote.player = null;
        }

        this.remotes.remove(remote);

    },


    // Players ----------------------------------------------------------------
    addPlayer: function(player) {

        this.log('Player joined', player.toString());

        this.players.each(function(other) {

            other.send([
                Network.Player.Join.Remote,
                player.serialize(true)
            ]);

            player.send([
                Network.Player.Join.Remote,
                other.serialize(true)
            ]);

        });

        player.send([
            Network.Player.Join.Local,
            player.serialize(true)
        ]);

        this.players.add(player);

        return player;

    },

    removePlayer: function(player) {
        if (this.players.remove(player)) {
            this.server.send([Network.Player.Leave, player.serialize()]);
            this.log('Player left', player.toString());
        }
    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        var parts = Array.prototype.slice.call(arguments);
        parts.unshift('[Server]');
        console.log.apply(console, parts);
    }

});


// Exports --------------------------------------------------------------------
exports.Server = Server;

