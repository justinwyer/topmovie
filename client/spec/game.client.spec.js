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
            playerOne.on('searching', function () {
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
            this.timeout(10000);
            playerOne.on('waiting', function (message) {
                playerOne.on('joined game', function (message) {
                    expect(message).to.deep.equal({name: 'player one vs player two'});
                    playerTwo.on('joined game', function (message) {
                        expect(message).to.deep.equal({name: 'player one vs player two'});
                        done();
                    });
                });
            });
        });

        it('should present the first movie', function (done) {
            this.timeout(10000);
            var expected = {movie: { name: 'Howl\'s Moving Castle',
                    years: [ 2003, 2004, 2006 ],
                    imageUrl: 'http://ia.media-imdb.com/images/M/MV5BMTY1OTg0MjE3MV5BMl5BanBnXkFtZTcwNTUxMTkyMQ@@._V1_SX640_SY720_.jpg' }
            };
            playerOne.on('game', function (message) {
                expect(message).to.deep.equal(expected);
                playerTwo.on('game', function (message) {
                    expect(message).to.deep.equal(expected);
                    done();
                });
            });
        });

        it('should present the next movie after round length expires', function (done) {
            this.timeout(10000);
            var count = 0;
            playerTwo.on('game', function (message) {
                count += 1;
                if (count == 2) {
                    expect(message).to.deep.equal({movie: {
                        name: 'A Beautiful Mind',
                        years: [ 2001, 2002, 2000 ],
                        imageUrl: 'http://ia.media-imdb.com/images/M/MV5BMTQ4MDI2MzkwMl5BMl5BanBnXkFtZTYwMjk0NTA5._V1_SX640_SY720_.jpg' }
                    });
                    done();
                }
            });
        });

        it('should end the game after 8 rounds', function (done) {
            this.timeout(10000);
            var count = 0;
            playerTwo.on('game', function (message) {
                count += 1;
                if (message.movie.name === 'Memento') {
                    playerTwo.answer('Memento', 2000);
                } else if (message.movie.name === 'Pulp Fiction') {
                    playerTwo.answer('Pulp Fiction', 1995);
                }
            });
            playerOne.on('game', function (message) {
                if (message.movie.name === 'Inception') {
                    playerOne.answer('Inception', 2010);
                } else if (message.movie.name === 'Downfall') {
                    playerOne.answer('Downfall', 2004);
                    playerOne.answer('Downfall', 2004);
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