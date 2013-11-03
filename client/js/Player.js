// Dependencies ---------------------------------------------------------------
var Class = require('../../shared/Class').Class,
    Actor = require('../../shared/Actor').Actor,
    Input = require('./lib/Input').Input;


// Player Abstraction ---------------------------------------------------------
var Player = Class(function(client, state, isLocal) {

    this.client = client;
    this.isLocal = isLocal || false;

    this.actor = new Actor(0, 0, 0, 0, 0);
    this.actor.restore(state);
    this.id = this.actor.id;
    this.meta = {};

}, {

    // Actions ----------------------------------------------------------------
    update: function(time, u) {
        this.actor.update(!this.isLocal, u);
        this.client.map.collide(this);
        this.actor.store();
    },

    updateState: function(state) {
        this.actor.receive(state, this.isLocal);
    },

    updateMeta: function(meta) {
        this.meta = meta;
    },

    serialize: function() {
        return this.actor.serialize(false);
    },


    // Local Player Methods ---------------------------------------------------
    input: function(input, u) {

        var mousePos = input.getPosition(),
            tr = this.actor.position.r;

        if (mousePos !== null) {
            var mdx = mousePos.x - this.actor.position.x,
                mdy = mousePos.y - this.actor.position.y;

            tr = Math.round(Math.atan2(mdy, mdx) * (180 / Math.PI));
        }

        var inputState = [
            input.isDown(Input.Key.A),
            input.isDown(Input.Key.D),
            input.isDown(Input.Key.W),
            input.isDown(Input.Key.S),
            tr
        ];

        this.actor.input(inputState, u);

        return inputState;

    },


    // Helpers ----------------------------------------------------------------
    toString: function() {
        return '[Player #' + this.id + ']';
    }

});


// Exports --------------------------------------------------------------------
exports.Player = Player;

