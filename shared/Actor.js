// Dependencies ---------------------------------------------------------------
var Class = require('../shared/Class').Class,
    Position = require('./Position').Position;


// Networked Actor Abstraction -------------------------------------------------
var Actor = Class(function(x, y, r, speed, angular, radius) {

    this.id = ++Actor.uID;
    this.tick = 0;
    this.states = [];
    this.inputState = 0;

    // Position / Angle
    this.position = new Position(x, y, r);

    // Velocities / Target angle
    this.velocity = new Position(0, 0, 0);

    // Cached Remote Position
    this.remote = new Position(x, y, r);

    // Speed limit (in units per second)
    this.speed = speed;

    // Rotation Limit (in degrees per second)
    this.angular = angular;

    // Collision Radius
    this.radius = radius;

}, {

    // Statics ----------------------------------------------------------------
    $uID: 0,
    $StateBufferSize: 30, // Higher RT needs higher BufferSize
    $StateDelay: 2,
    $ErrorRange: 5,


    // Methods ----------------------------------------------------------------
    input: function(inputState, u) {

        var vx = 0,
            vy = 0;

        if (inputState[0]) {
            vx -= this.speed * u;
        }

        if (inputState[1]) {
            vx += this.speed * u;
        }

        if (inputState[2]) {
            vy -= this.speed * u;
        }

        if (inputState[3]) {
            vy += this.speed * u;
        }

        this.velocity.set(vx, vy, inputState[4]);

        this.inputState = (
            (+inputState[0]) |
            (+inputState[1] << 1) |
            (+inputState[2] << 2) |
            (+inputState[3] << 3) |
            (+inputState[5] << 4) |
            (+inputState[6] << 5)
        );

    },

    receive: function(state, correctPosition) {

        this.remote.set(state[3], state[4], state[2]);

        if (correctPosition) {

            // See how much the local states diverge from the remote position
            var minDistance = 1000000000000,
                index = -1;

            for(var i = 0; i < this.states.length; i++) {

                var local = this.states[i],
                    dx = (local[3] - state[3]),
                    dy = (local[4] - state[4]),
                    dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDistance){
                    minDistance = dist;
                    index = i;
                }

            }

            // Any distance?
            if (minDistance > 0) {

                // Calculate the tick difference
                var tickDiff = this.tick - state[1];
                if (tickDiff < 0) {
                    tickDiff += Actor.StateBufferSize;
                }

                tickDiff = Math.max(tickDiff, 1);

                // If the distance it outside the error range
                // we ran into heavy lag or local cheating
                // in either case, reset the position to the server state
                if (minDistance > Actor.ErrorRange * tickDiff) {
                    this.position.x = state[3];
                    this.position.y = state[4];
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }

            }

        }

    },

    update: function(remote, u) {

        this.tick = (this.tick + 1) % Actor.StateBufferSize;

        var vel;
        if (!remote) {

            // Calculate local velocity change
            vel = new Position(
                this.velocity.x,
                this.velocity.y,
                Position.lad(this.position.r, this.velocity.r)
            );

            // Limit Vectors
            vel.limit(this.speed * u, this.angular * u);

            // Update local position and cached remote position
            this.position.add(vel);

        } else {

            // Calculate local velocity change
            vel = this.position.diff(this.remote);

            // Limit Vectors
            vel.limit(this.speed * u, this.angular * u);

            // Set calculated velocties for visual updates
            this.velocity.x = vel.x;
            this.velocity.y = vel.y;
            this.velocity.r = vel.r;

            // Set the new local position of the remote actor
            this.position.add(vel);

            // Set the angle directly
            this.position.r = this.remote.r;

        }

    },

    store: function() {
        this.states.push(this.serialize(false));
        if (this.states.length > Actor.StateBufferSize) {
            this.states.shift();
        }
    },

    serialize: function(remote, full) {

        // Full state
        if (full) {
            return [
                this.id,
                this.tick,
                Math.round(this.position.r),
                Math.round(this.position.x),
                Math.round(this.position.y),
                this.inputState,
                this.speed,
                this.angular,
                this.radius
            ];

        // Delayed state when sending from server to client
        } else if (remote) {
            var state = this.states[this.states.length - 1 - Actor.StateDelay];
            return state ? state : this.serialize(false, false);

        // Update state
        } else {
            return [
                this.id,
                this.tick,
                Math.round(this.position.r),
                Math.round(this.position.x),
                Math.round(this.position.y),
                this.inputState
            ];
        }

    },

    restore: function(state) {

        this.id = state[0];
        this.position.set(state[3], state[4], state[2]);
        this.remote.set(state[3], state[4], state[2]);
        this.inputState = state[5];

        // Full state only
        if (state.length > 6) {
            this.speed = state[6];
            this.angular = state[7];
            this.radius = state[8];
        }

    }

});

// Exports --------------------------------------------------------------------
exports.Actor = Actor;

