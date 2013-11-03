// Dependencies ---------------------------------------------------------------
var Class = require('../../../shared/Class').Class,
    PIXI = require('../lib/pixi'),
    BasePlayer = require('../Player').Player,
    Position = require('../../../shared/Position').Position;


// Player Rendering -----------------------------------------------------------
var Player = Class(function(client, state, isLocal) {

    BasePlayer(this, client, state, isLocal);

	this.graphics = new PIXI.Graphics();

    // TODO move colors to shared?
    this.graphics.beginFill(this.isLocal ? 0x0000FF : 0xFF0000, 1);
	this.graphics.drawCircle(0, 0, this.actor.radius);
    this.graphics.endFill();

    this.graphics._pointer = new PIXI.Graphics();
    this.graphics.addChild(this.graphics._pointer);

    this.graphics._last = new Position();
    this.graphics._offset = new Position();

}, BasePlayer, {

    update: function(time, u) {
        BasePlayer.update(this, time, u);
        this.graphics._last.setVector(this.graphics._offset);
        this.graphics._offset.setVector(this.actor.position);
    },

    render: function(time, u) {

        var graphics = this.graphics;
        graphics._last.add(graphics._last.diff(graphics._offset).mul(u));
        graphics.position.x = Math.round(graphics._last.x);
        graphics.position.y = Math.round(graphics._last.y);

        var pointer = graphics._pointer;
        pointer.clear();
        pointer.lineStyle(2, this.isLocal ? 0x0000FF : 0xFF0000, 1);
        pointer.moveTo(0, 0);
        pointer.lineTo(
            Math.cos(graphics._last.r * (Math.PI / 180)) * this.actor.radius * 2,
            Math.sin(graphics._last.r * (Math.PI / 180)) * this.actor.radius * 2
        );

    },

    // TODO Delay until first render?
    addToStage: function(stage) {
        stage.addChild(this.graphics);
    },

    removeFromStage: function(stage) {
        stage.removeChild(this.graphics);
    }

});


// Exports --------------------------------------------------------------------
exports.Player = Player;

