describe('game socket', function () {
    var playerOne, playerTwo;

    describe('lobby', function () {
        beforeEach(function (done) {
            playerOne = new GameClient('ws://localhost:3000');
            playerOne.on('open', function () {
                playerOne.send({event: 'register', data: 'player one'});
                done();
            });
        });

        afterEach(function (done) {
            playerOne.on('close', function () {
                done();
            });
            playerOne.close();
        });

        it('should let a player know they are waiting for an opponent when they join', function (done) {
            playerOne.on('waiting', function () {
                done();
            });
        });
    });

    describe('game', function () {
        beforeEach(function (done) {
            playerOne = new GameClient('ws://localhost:3000');
            playerOne.on('open', function () {
                playerOne.send({event: 'register', data: 'player one'});
                playerTwo = new GameClient('ws://localhost:3000');
                playerTwo.on('open', function () {
                    playerTwo.send({event: 'register', data: 'player two'});
                    done();
                });
            });
        });

        afterEach(function (done) {
            playerOne.on('close', function () {
                playerTwo.on('close', function () {
                    done();
                });
                playerTwo.close();
            });
            playerOne.close();
        });

        it('should let players know they have joined a game', function (done) {
            playerOne.on('joined game', function (message) {
                expect(message).to.deep.equal({name: 'player one vs player two'});
                playerTwo.on('joined game', function (message) {
                    expect(message).to.deep.equal({name: 'player one vs player two'});
                    done();
                });
            });
        });
    });
});