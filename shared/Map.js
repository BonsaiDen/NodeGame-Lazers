// Dependencies ---------------------------------------------------------------
var Class = require('../shared/Class').Class,
    SAT = require('./lib/SAT').SAT;


// Map Logic ------------------------------------------------------------------
var Map = Class(function(width, height, data) {

    this.width = width;
    this.height = height;
    this.parse(data || []);

}, {

    // Statics ----------------------------------------------------------------
    $polygonFromPoints: function(x, y, points) {

        var p = new SAT.Vector(x, y),
            vectors = [];

        for(var i = 0, l = points.length; i < l; i += 2) {
            vectors.push(new SAT.Vector(points[i], points[i + 1]));
        }

        return new SAT.Polygon(p, vectors);

    },


    // Methods ----------------------------------------------------------------
    parse: function(data) {

        this.data = data;
        this.structures = [];

        for(var i = 0, l = data.length; i < l; i++) {

            var desc = data[i];
            this.structures.push({
                polygon: Map.polygonFromPoints(desc[0], desc[1], desc[2])
            });

        }

        console.log(this.structures);

    },

    collide: function(player) {

        var actor = player.actor,
            radius = actor.radius,
            position = actor.position;

        if (position.x < 0) {
            position.x = 0;

        } else if (position.x > this.width) {
            position.x = this.width;
        }

        if (position.y < 0) {
            position.y = 0;

        } else if (position.y > this.height) {
            position.y = this.height;
        }

        var circle = new SAT.Circle(new SAT.Vector(position.x, position.y), radius),
            response = new SAT.Response();

        this.structures.forEach(function(struct) {

            var collided = SAT.testPolygonCircle(struct.polygon, circle, response);
            if (collided) {
                actor.position.x += response.overlapV.x;
                actor.position.y += response.overlapV.y;
            }

        });

    },

    serialize: function() {
        return [this.width, this.height, this.data];
    },

    restore: function(state) {
        console.log(state);
        this.width = state[0];
        this.height = state[1];
        this.parse(state[2]);
    }

});


// Exports --------------------------------------------------------------------
exports.Map = Map;

