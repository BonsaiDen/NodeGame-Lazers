/*global requestAnimFrame */

// Dependencies ---------------------------------------------------------------
var Class = require('./Class').Class;


// Stable Game Loop Implementation --------------------------------------------
var Loop = Class(function(fps, update, render, scope) {

    this.fps = fps;
    this.tps = 1000 / fps;
    this.isRunning = false;

    this.started = 0;
    this.count = 0;
    this.last = 0;
    this.lastRender = 0;
    this.buffer = 0;
    this.interval = null;
    this.updateCallback = update;
    this.renderCallback = render;
    this.scope = scope || null;

    console.log(this.fps, this.tps);

}, {

    // Statics ----------------------------------------------------------------
    $Update:  {
        Normal: 0,
        Final: 1,
        Tick: 2
    },


    // Methods ----------------------------------------------------------------
    start: function() {

        this.interval = setInterval(this.update.bind(this), this.tps / 2);
        this.buffer = 0;
        this.last = Date.now();
        this.lastRender = Date.now();
        this.started = Date.now();
        this.isRunning = true;

        if (this.renderCallback) {
            this.render();
        }

    },

    stop: function() {

        clearInterval(this.interval);
        this.isRunning = false;
        this.buffer = 0;
        this.last = 0;
        this.started = 0;

    },

    update: function() {

        var time = Date.now(),
            diff = time - this.started,
            count = Math.floor(diff / this.tps);

        if (count > this.count) {

            this.buffer += time - this.last;
            this.last = time;

            var u = this.tps * (count - this.count) / 100;
            this.updateCallback.call(this.scope, Loop.Update.Normal, time, u);
            this.count = count;

            this.updateCallback.call(this.scope, Loop.Update.Final, time, u);

            if (this.buffer > 1000) {
                this.updateCallback.call(this.scope, Loop.Update.Tick, time, u);
                this.buffer = 0;
            }

        }

    },

    render: function() {

        if (this.isRunning) {

            requestAnimFrame(this.render.bind(this));

            var time = Date.now();
            if (time - this.lastRender > 16) {
                var u = 1.0 / this.tps * (time - this.last);
                this.renderCallback.call(this.scope, time, u);
                this.lastRender = time;
            }

        }

    }

});


// Exports --------------------------------------------------------------------
exports.Loop = Loop;

