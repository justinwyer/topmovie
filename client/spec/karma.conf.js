module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'chai'],

        files: [
            '../../bower_components/eventEmitter/EventEmitter.js',
            '*.spec.js',
                '../main/*.js'
        ]
    });
};