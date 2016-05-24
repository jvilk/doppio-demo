///<reference path="./typings/main.d.ts" />

/**
 * Contains all of doppio's grunt build tasks in TypeScript.
 */
import path = require('path');
import fs = require('fs');
import os = require('os');
import _ = require('underscore');
import child_process = require('child_process');
var webpackConfig = require('./webpack.config.js');

const buildDir = path.resolve(__dirname, 'build'),
  gitData = child_process.execSync('git rev-parse HEAD'),
  mustacheData = {
    git_hash: gitData.toString(),
    git_short_hash: gitData.toString().slice(0, 6),
    date: (new Date()).toLocaleDateString()
  };

export function setup(grunt: IGrunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    build: {
      java: 'java',
      javap: 'javap',
      javac: 'javac'
    },
    listings: {
      options: {
        output: 'build/programs/listings.json',
        cwd: path.resolve(__dirname, 'build', 'programs')
      },
      default: {}
    },
    copy: {
      build: {
        files: [
          {
            expand: true, flatten: true,
            src: [path.resolve(__dirname, 'node_modules/doppiojvm/dist/release/doppio.js*')],
            dest: path.resolve(buildDir, 'js')
          },
          {
            expand: true, flatten: true,
            src: [path.resolve(__dirname, 'node_modules/browserfs/dist/browserfs.min.*')],
            dest: path.resolve(buildDir, 'js')
          },
          {
            expand: true, flatten: false,
            cwd: 'node_modules/doppiojvm/vendor',
            src: ['websockify/**/*'],
            dest: 'build/js'
          }
        ]
      }
    },
    compress: {
      doppio_home: {
        options: {
          level: 9,
          archive: 'build/doppio_home.zip'
        },
        files: [
          { expand: true, cwd: 'node_modules/doppiojvm', src: ['vendor/java_home/**/*'], dest: '' },
          { expand: true, cwd: 'node_modules/doppiojvm/dist/release/', src: ['natives/**/*.js'], dest: ''},
          { expand: true, cwd: 'demo_files', src: ['+(classes|files)/**/*'], dest: ''},
          { expand: true, cwd: 'demo_files', src: ['motd'], dest: ''}
        ]
      }
    },
    javac: {
      default: {
        files: [{
          expand: true,
          src: 'demo_files/classes/**/*.java'
        }]
      }
    },
    mustache_render: {
      release: {
        files: [
          {
            data: mustacheData,
            template: `src/html/index.mustache`,
            dest: `build/index.html`
          }
        ]
      }
    },
    watch: {
      'mustache-templates': {
        files: ['src/html/*.mustache'],
        tasks: ['mustache_render:release'],
        options: {
          atBegin: true
        }
      },
      java: {
        files: ['demo_files/**/*.java'],
        tasks: [
          'javac',
          'copy:build'
        ],
        options: {
          atBegin: true
        }
      }
    },
    webpack: {
      build: webpackConfig
    },
    'webpack-dev-server': {
      options: _.extend({
        webpack: webpackConfig
      }, webpackConfig.devServer),
      watch: {
        watch: true,
        keepAlive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-webpack');
  // Load our custom tasks.
  grunt.loadTasks('tasks');

  grunt.registerTask('doppio_home', 'Compresses doppio_home.zip if needed.', function() {
    if (!grunt.file.exists('build/doppio_home.zip')) {
      grunt.task.run(['compress']);
    }
  });

  /**
   * PUBLIC-FACING TARGETS BELOW.
   */

  grunt.registerTask('build',
    [
      'find_native_java',
      'javac',
      'mustache_render:release',
      'copy:build',
      'doppio_home',
      'listings',
      'webpack:build'
    ]);

  grunt.registerTask('default', ['build']);
};
