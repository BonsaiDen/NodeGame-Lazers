// Dependencies ---------------------------------------------------------------
var Class = require('../../../shared/Class').Class,
    PIXI = require('../lib/pixi'),
    BaseMap = require('../../../shared/Map').Map;


// Map Rendering --------------------------------------------------------------
var Map = Class(function(width, height, data) {
    BaseMap(this, width, height, data);
    this.graphics = [];

}, BaseMap, {

    render: function(time, u) {

    },

    parse: function(data) {

        BaseMap.parse(this, data);

        this.graphics = this.structures.map(function(struct) {

            var g = new PIXI.Graphics(),
                p = struct.polygon;

            g.lineStyle(4, 0xffd900, 1);
            p.points.forEach(function(point, index) {
                if (index === 0) {
                    g.moveTo(point.x, point.y);

                } else {
                    g.lineTo(point.x, point.y);
                }
            });
            g.lineTo(p.points[0].x, p.points[0].y);

            g.position.x = p.pos.x;
            g.position.y = p.pos.y;

            return g;

        });

    },

    addToStage: function(stage) {
        console.log(this.graphics);
        this.graphics.forEach(function(g) {
            stage.addChild(g);
        });
    },

    removeFromStage: function(stage) {
        this.graphics.forEach(function(g) {
            stage.removeChild(g);
        });
    }

});


// Exports --------------------------------------------------------------------
exports.Map = Map;

