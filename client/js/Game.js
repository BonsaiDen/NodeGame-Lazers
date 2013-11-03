// Dependencies ---------------------------------------------------------------
var Class = require('../../shared/Class').Class,
    PIXI = require('./lib/pixi'),
    Input = require('./lib/Input').Input;


// Game Client ----------------------------------------------------------------
var Game = Class(function(client, element, map) {

    this.map = map;

    this.stage = new PIXI.Stage(0xFFFFFF, true);
    this.input = new Input();

    // TODO implement scrolling and limits via map.collide()
    this.container = document.getElementById(element);

    // TODO set viewport size
	this.renderer = PIXI.autoDetectRenderer(this.map.width, this.map.height, null, false, true);
	this.renderer.view.tabindex = '1';
	this.renderer.view.style.display = 'block';
	this.renderer.view.onselectstart = function(e) {
        e.preventDefault();
        return false;
    };
	this.container.appendChild(this.renderer.view);
    this.input.bind(this.renderer.view);

    this.map.addToStage(this.stage);

}, {

    // Actions ----------------------------------------------------------------
    update: function(time) {
        this.input.update(time);
    },

    render: function() {
        this.renderer.render(this.stage);
    },

    destroy: function() {
        this.map.removeFromStage(this.stage);
        this.container.removeChild(this.renderer.view);
        this.input.unbind();
        this.input = null;
        this.renderer = null;
        this.container = null;
        this.stage = null;
    },


    // Players ----------------------------------------------------------------
    addPlayer: function(player) {
        player.addToStage(this.stage);
    },

    removePlayer: function(player) {
        player.removeFromStage(this.stage);
    },


    // Helpers ----------------------------------------------------------------
    log: function() {
        var parts = Array.prototype.slice.call(arguments);
        parts.unshift('[Game]');
        this.client.log.apply(this.client, parts);
    }

});


// Exports --------------------------------------------------------------------
exports.Game = Game;

