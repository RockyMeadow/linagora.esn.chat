'use strict';

var conf_path = './test/config/';
var servers = require(conf_path + 'servers-conf');
//var config = require('./config/default.json');
var GruntfileUtils = require('./tasks/utils/Gruntfile-utils');

module.exports = function(grunt) {
  var gruntfileUtils = new GruntfileUtils(grunt, servers);
  var runGrunt = gruntfileUtils.runGrunt();
  var shell = gruntfileUtils.shell();
  var command = gruntfileUtils.command();

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: [],
      },
      all: {
        src: [
          'Gruntfile.js',
          'tasks/**/*.js',
          'test/**/**/*.js',
          'backend/**/*.js',
          'frontend/js/**/*.js'
        ]
      }
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= jshint.all.src %>']
      },
      css: {
        options: {
          rules: [
            { pattern: /important;(\s*$|(?=\s+[^\/]))/, message: 'CSS important rules only allowed with explanatory comment' }
          ]
        },
        src: [
          'frontend/css/**/*.less'
        ]
      },
      quick: {
        src: ['<%= jshint.quick.src %>']
      }
    },

    mochacli: {
      options: {
        require: ['chai', 'mockery'],
        reporter: 'spec',
        timeout: process.env.TEST_TIMEOUT || 20000
      },
      backend: {
        options: {
          files: ['test/unit-backend/all.js', grunt.option('test') || 'test/unit-backend/**/*.js']
        }
      },
      midway: {
        options: {
          files: ['test/midway-backend/all.js', grunt.option('test') || 'test/midway-backend/**/*.js']
        }
      }
    },
    shell: {
      mongo: shell.newShell(command.mongo(false), new RegExp('connections on port ' + servers.mongodb.port), 'MongoDB server is started.'),
    },
    run_grunt: {
      midway_backend: runGrunt.newProcess(['test-midway-backend']),
      unit_backend: runGrunt.newProcess(['test-unit-backend'])
    },
    karma: {
      unit: {
        configFile: './test/config/karma.conf.js',
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-continue');
  grunt.loadNpmTasks('grunt-run-grunt');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-wait-server');

  grunt.loadTasks('tasks');

  grunt.registerTask('linters', 'Check code for lint', ['jshint:all', 'jscs:all', 'lint_pattern:all']);
  grunt.registerTask('linters-dev', 'Check changed files for lint', ['prepare-quick-lint', 'jshint:quick', 'jscs:quick', 'lint_pattern:quick']);
  grunt.registerTask('spawn-servers', 'spawn servers', ['shell:mongo']);
  grunt.registerTask('kill-servers', 'kill servers', ['shell:mongo:kill']);
  grunt.registerTask('setup-environment', 'create temp folders and files for tests', gruntfileUtils.setupEnvironment());
  grunt.registerTask('clean-environment', 'remove temp folder for tests', gruntfileUtils.cleanEnvironment());
  grunt.registerTask('setup-mongo', ['spawn-servers', 'continue:on']);
  grunt.registerTask('test-midway-backend', ['setup-environment', 'setup-mongo', 'run_grunt:midway_backend', 'kill-servers', 'clean-environment']);
  grunt.registerTask('test-unit-backend', 'Test backend code', ['mochacli:backend']);
  grunt.registerTask('test-unit-frontend', 'Test frontend code', ['karma:unit']);
  grunt.registerTask('test', ['linters', 'test-unit-backend', 'test-midway-backend']);
  grunt.registerTask('test-all', ['linters', 'test-unit-frontend', 'test-unit-backend', 'test-midway-backend']);
  grunt.registerTask('default', ['test']);
};
