describe('game socket', function () {
    var playerOne, playerTwo;

    describe('lobby', function () {
        beforeEach(function () {
            playerOne = new GameClient('ws://localhost:3000', 'solo player');
        });

        afterEach(function (done) {
            playerOne.on('close', function () {
                done();
            });
            playerOne.close();
        });

        it('should let a player know they are waitin for an opponent when they join', function (done) {
            playerOne.on('waiting', function () {
                expect(playerOne.isRegistered()).to.be.true;
                done();
            });
        });
    });

    describe('game', function () {
        beforeEach(function () {
            playerOne = new GameClient('ws://localhost:3000', 'player one');
            playerTwo = new GameClient('ws://localhost:3000', 'player two');
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

        it('should present the first movie', function (done) {
            playerOne.on('game', function (message) {
                expect(message).to.deep.equal({scores: {'player one':0, 'player two':0}, movie: {name: 'The Silence of the Lambs', years: [1989, 1991, 1988], id: 'tt0102926'}});
                playerTwo.on('game', function (message) {
                    expect(message).to.deep.equal({scores: {'player one':0, 'player two':0}, movie: {name: 'The Silence of the Lambs', years: [1989, 1991, 1988], id: 'tt0102926'}});
                    done();
                });
            });
        });

        it('should present the next movie after round length expires', function (done) {
            this.timeout(5000);
            var count = 0;
            playerTwo.on('game', function (message) {
                count += 1;
                if (count == 2) {
                    expect(message).to.deep.equal({scores: {'player one':0, 'player two':0}, movie: {name: 'Strangers on a Train', years: [1948, 1951, 1951], id: 'tt0044079'}});
                    done();
                }
            });
        });

        it('should end the game after 8 rounds', function (done) {
            this.timeout(5000);
            var count = 0;
            playerTwo.on('game', function (message) {
                count += 1;
                if (message.movie.name === 'Dog Day Afternoon') {
                    playerTwo.answer('Dog Day Afternoon', 1975)
                } else if (message.movie.name === 'The Shining') {
                    playerTwo.answer('The Shining', 1985)
                }
            });
            playerOne.on('game', function (message) {
                if (message.movie.name === 'Trainspotting') {
                    playerOne.answer('Trainspotting', 1996)
                } else if (message.movie.name === 'Platoon') {
                    playerOne.answer('Platoon', 1986)
                }
            });
            playerTwo.on('game over', function (message) {
                expect(count).to.equal(8);
                expect(message.scores['player one']).to.equal(10);
                expect(message.scores['player two']).to.equal(2);
                done();
            });
        });
    });
});