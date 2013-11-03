// Dependencies ---------------------------------------------------------------
var Game = require('./Game').Game,
    lithium = require('./lib/lithium').lithium, // TODO require from node_modules
    BISON = require('bisonjs'),
    Class = require('../../shared/Class').Class,
    HashList = require('../../shared/HashList').HashList,
    Network = require('../../shared/Network').Network,
    Loop = require('../../shared/Loop').Loop,
    Map = require('../../shared/Map').Map,
    Player = require('./graphics').Player;


// Client ---------------------------------------------------------------------
var Client = Class(function() {

    this.net = new lithium.Client(
        this.onConnection.bind(this),
        BISON.encode,
        BISON.decode
    );

    this.reset();

}, {

    // Actions ----------------------------------------------------------------
    reset: function() {
        this.loop = null;
        this.game = null;
        this.config = null;
        this.map = null;
        this.player = null;
        this.players = null;
        this.messages = [];
    },

    connect: function(port, host) {
        this.net.connect(port || 4000, host || window.location.hostname);
    },

    update: function(type, time, u) {

        if (type === Loop.Update.Normal) {

            // Handle Network messages
            for(var i = 0, l = this.messages.length; i < l; i++) {
                this.handleMessage(this.messages[i]);
            }
            this.messages.length = 0;

            // Update Local Player Input
            if (this.player) {
                this.player.input(this.game.input, u);
            }

            // Update all Players
            if (this.players) {
                this.players.each(function(player) {
                    player.update(time, u);
                });
            }

            // Update Game Logic
            this.game.update(time, u);

        } else if (type === Loop.Update.Final) {
            if (this.player) {
                this.send([
                    Network.Player.LocalState,
                    this.player.serialize()
                ]);
            }
        }

    },

    render: function(time, u) {

        if (this.players) {
            this.players.each(function(player) {
                player.render(time, u);
            });
        }

        this.game.render(time, u);

    },

    send: function(msg) {
        this.net.send(msg);
    },


    // Events -----------------------------------------------------------------
    onConnection: function(client) {
        client.on('message', this.onMessage.bind(this));
        client.on('close', this.onClose.bind(this));
    },

    onMessage: function(msg) {

        var type = msg[0],
            state = msg[1];

        if (type === Network.Server.Config) {
            this.config = state;

        } else if (type === Network.Server.Map) {
            this.map = new Map();
            this.map.restore(state);
            this.game = new Game(this, 'canvas', this.map);

        } else if (type === Network.Server.Start) {

            this.loop = new Loop(this.config.fps, this.update, this.render, this);
            this.loop.start();

            this.player = null;
            this.players = new HashList();
            this.messages = [];

            // TODO move into login / connect function
            this.send([Network.Client.Play, ['BonsaiDen']]);

        } else {
            this.messages.push(msg);
        }

    },

    handleMessage: function(msg) {

        var type = msg[0],
            state = msg[1];

        if (type === Network.Player.Join.Local) {
            this.player = this.addPlayer(new Player(this, state, true));

        } else if (type === Network.Player.Join.Remote) {
            this.addPlayer(new Player(this, state, false));

        } else if (type === Network.Player.RemoteState) {
            var player = this.players.get(state[0]);
            if (player) {
                player.updateState(state);
            }

        } else if (type === Network.Player.Leave) {
            this.removePlayer(this.players.get(state[0]));

        } else {
            this.log('Message', msg);
        }

    },

    onClose: function() {

        if (this.game) {
            this.game.destroy();
        }

        if (this.loop) {
            this.loop.stop();
        }

        this.players = null;
        this.player = null;
        this.messages = null;

        this.reset();

    },


    // Players ----------------------------------------------------------------
    addPlayer: function(player) {
        this.players.add(player);
        this.game.addPlayer(player);
        this.log('Player joined', player.toString());
        return player;
    },

    removePlayer: function(player) {
        this.players.remove(player);
        this.game.removePlayer(player);
        this.log('Player left', player.toString());
    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        var parts = Array.prototype.slice.call(arguments);
        parts.unshift('[Client]');
        console.log.apply(console, parts);
    }

});


// Initialize -----------------------------------------------------------------
window.client = new Client();
window.client.connect();

