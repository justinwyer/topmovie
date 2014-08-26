module.exports = function (grunt) {
    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },
        watch: {
            express: {
                files: ['server/main/*.js'],
                tasks: ['express:dev', 'karma:integration:run'],
                options: {
                    spawn: false
                }
            },
            karma: {
                files: ['client/**/*.js'],
                tasks: ['karma:integration:run']
            },
            mochaTest: {
                files: 'server/**/*.js',
                tasks: ['mochaTest']
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['server/spec/*.js']
            }
        },
        karma: {
            integration: {
                configFile: 'client/spec/karma.conf.js',
                background: true,
                runnerPort: 9877,
                browsers: ['Chrome']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('test:full', ['express:dev', 'mochaTest', 'karma:integration', 'watch'])
    grunt.registerTask('test:unit', ['mochaTest', 'watch:mochaTest'])
};