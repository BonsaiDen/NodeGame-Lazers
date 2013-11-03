// Network Constants ----------------------------------------------------------
var Network = {

    Player: {
        Join: {
            Local: 0,
            Remote: 1,
        },
        LocalState: 2,
        RemoteState: 3,
        Leave: 4
    },

    Server: {
        Config: 10,
        Map: 11,
        Start: 12,
        Stats: 20
    },

    Client: {
        Play: 40,
        Observe: 41
    }

};


// Exports --------------------------------------------------------------------
exports.Network = Network;

