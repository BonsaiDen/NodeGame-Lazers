// 2D Position Class ----------------------------------------------------------
function Position(x, y, r) {
    this.x = x || 0;
    this.y = y || 0;
    this.r = r || 0;
}

Position.lad = function(x, y) {
    var a = (x * Math.PI / 180) - Math.PI,
        b = (y * Math.PI / 180) - Math.PI;

    return Math.round(Math.atan2(Math.sin(b - a), Math.cos(b - a)) * (180 / Math.PI));
};


// Methods --------------------------------------------------------------------
Position.prototype = {

    set: function(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        return this;
    },

    setVector: function(other) {
        this.x = other.x;
        this.y = other.y;
        this.r = other.r;
        return this;
    },

    add: function(other) {
        this.x = this.x + other.x;
        this.y = this.y + other.y;
        this.r = (this.r + other.r) % 360;
        return this;
    },

    mul: function(m) {
        this.x *= m;
        this.y *= m;
        this.r = (this.r * m) % 360;
        return this;
    },

    limit: function(ls, lr) {

        var ds = Math.min(Math.sqrt(this.x * this.x + this.y * this.y), ls),
            dr = Math.atan2(this.y, this.x);

        this.x = Math.cos(dr) * ds;
        this.y = Math.sin(dr) * ds;
        this.r = this.r > 0 ? Math.min(this.r, lr) : Math.max(this.r, -lr);

    },

    diff: function(other) {
        return new Position(
            other.x - this.x,
            other.y - this.y,
            -Position.lad(other.r, this.r)
        );
    }

};


// Exports --------------------------------------------------------------------
exports.Position = Position;

