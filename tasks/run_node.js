/*
 * grunt-run-node
 * https://github.com/jamesdbloom/grunt-run-node
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the MIT license.
 */

'use strict';

var processList;

module.exports = function (grunt) {

    processList = (function (grunt) {
        var spawn = require('child_process').spawn,
            processes = [];

        return {
            add: function (command, args, options) {
                processes.shift(spawn(command, args, options));
                grunt.log.ok("Started " + command + " " + args.join(" "));
            },
            stop_all: function () {
                for (var i = 0; i < processes.length; i++) {
                    processes[i].kill();
                }
            }
        };
    })(grunt);

    grunt.registerMultiTask('run_node', 'Start node asynchronously from your grunt build.', function () {
        // mark task as asynchronous
        var done = this.async();

        this.files.forEach(function (file) {
            file.src.forEach(function (filepath, index, array) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    done(false);
                } else {
                    processList.add('node', [filepath], {
                        cwd: grunt.option('cwd') || process.cwd(),
                        stdio: grunt.option('stdio') || [ 'ignore', (grunt.option('verbose') ? process.stdout : 'ignore'), process.stderr ],
                        env: grunt.option('env'),
                        detached: grunt.option('detached')
                    });
                }
                // last element
                if (index === array.length - 1) {
                    done(true);
                }
            });
        });
    });

    grunt.registerMultiTask('stop_node', 'Stops node instances previously started from your grunt build.', function () {
        processList.stop_all();
    });

};
