module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        browsers: ['Chrome'],

        files: [
            '../../bower_components/eventEmitter/EventEmitter.js',
            '*.spec.js',
                '../main/*.js'
        ],

        port: 9018,
        runnerPort: 9101,
        autoWatch: false
    });
};