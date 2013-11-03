// Dependencies ---------------------------------------------------------------
var Class = require('../shared/Class').Class,
    Actor = require('../shared/Actor').Actor,
    Network = require('../shared/Network').Network;


// Player Abstraction ---------------------------------------------------------
var Player = Class(function(server, remote, meta) {

    this.id = null;
    this.actor = null;
    this.meta = {
        username: (meta[0] || '').substring(0, 8)
    };

    this.server = server;
    this.remote = remote;
    this.remote.player = this;

    this.init();

}, {

    // Actions ----------------------------------------------------------------
    init: function() {

        this.actor = new Actor(
            ~~(Math.random() * 640),
            ~~(Math.random() * 480),
            ~~(Math.random() * 360),
            15,
            45,
            8
        );

        this.states = [];
        this.id = this.actor.id;

    },

    update: function(time, u) {
        this.actor.update(true, u);
        this.server.map.collide(this);
        this.actor.store();
    },

    updateState: function(state) {
        this.actor.receive(state);
    },


    // Network ----------------------------------------------------------------
    send: function(msg) {
        return this.remote.send(msg);
    },

    serialize: function(initial) {
        return this.actor.serialize(true, initial);
    },

    serializeMeta: function() {
        return [this.id, this.meta];
    },


    // Events -----------------------------------------------------------------
    onMessage: function(type, data) {
        if (type === Network.Player.LocalState) {
            this.updateState(data);
        }
    },

    onClose: function() {
        this.server.removePlayer(this);
        this.id = null;
        this.actor = null;
        this.states = null;
    },


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return '[Player #' + this.id + '] ' + this.remote.toString();
    }

});


// Exports --------------------------------------------------------------------
exports.Player = Player;

