describe('game socket', function () {
    chai.config.truncateThreshold = 0;
    var playerOne, playerTwo;

    describe('lobby', function () {
        beforeEach(function () {
            playerOne = new GameClient('ws://localhost:3000/quiz', 'solo player');
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
        beforeEach(function () {
            playerOne = new GameClient('ws://localhost:3000/quiz', 'player one');
            playerTwo = new GameClient('ws://localhost:3000/quiz', 'player two');
        });

        afterEach(function (done) {
            if (!playerOne.connected && !playerTwo.connected) {
                done();
            }
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
            var expected = {scores: {'player one': 0, 'player two': 0},
                movie: { name: 'Touch of Evil',
                    years: [ 1958, 1955, 1956 ],
                    id: 'tt0052311' }};
            playerOne.on('game', function (message) {
                expect(message).to.deep.equal(expected);
                playerTwo.on('game', function (message) {
                    expect(message).to.deep.equal(expected);
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
                    expect(message).to.deep.equal({scores: {'player one':0, 'player two':0},
                        movie: { name: 'In the Name of the Father',
                            years: [ 1990, 1991, 1993 ],
                            id: 'tt0107207' }});
                    done();
                }
            });
        });

        it('should end the game after 8 rounds', function (done) {
            this.timeout(5000);
            var count = 0;
            playerTwo.on('game', function (message) {
                count += 1;
                if (message.movie.name === 'Spirited Away') {
                    playerTwo.answer('Spirited Away', 2001);
                } else if (message.movie.name === 'Aliens') {
                    playerTwo.answer('Aliens', 1985);
                }
            });
            playerOne.on('game', function (message) {
                if (message.movie.name === 'American History X') {
                    playerOne.answer('American History X', 1998);
                } else if (message.movie.name === 'Raiders of the Lost Ark') {
                    playerOne.answer('Raiders of the Lost Ark', 1981);
                    playerOne.answer('Raiders of the Lost Ark', 1981);
                }
            });
            playerTwo.on('game over', function (message) {
                expect(count).to.equal(8);
                expect(message).to.deep.equal({scores: {'player one': 10, 'player two': 2}});
                playerTwo.on('close', function () {
                    done();
                });
            });
        });
    });
});