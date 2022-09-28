const { createGameServer } = require('../helpers');

describe("createGameServer", () => {
    it("should create a game server", () => {
        createGameServer(8083);
    })
})
