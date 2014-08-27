module.exports = function (grunt) {
    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: 'dev.js'
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
                tasks: ['express:dev', 'karma:integration:run']
            },
            options: {
                spawn: false
            }
        },
        karma: {
            develop: {
                configFile: 'client/spec/karma.integration.conf.js',
                background: true,
                runnerPort: 9877,
                browsers: ['Chrome']
            },
            integration: {
                configFile: 'client/spec/karma.integration.conf.js',
                singleRun: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('develop', ['express:dev', 'karma:develop:start', 'watch']);
    grunt.registerTask('test', ['express:dev', 'karma:integration:start']);
};