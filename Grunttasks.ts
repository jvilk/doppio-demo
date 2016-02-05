///<reference path="./typings/tsd.d.ts" />

/**
 * Contains all of doppio's grunt build tasks in TypeScript.
 */
import path = require('path');
import fs = require('fs');
import os = require('os');
import _ = require('underscore');
import child_process = require('child_process');
var webpackConfig = require('./webpack.config.js');

const vendorDir = path.resolve(__dirname, "vendor"),
  javaHomeDir = path.resolve(vendorDir, "java_home"),
  buildDir = path.resolve(__dirname, 'build'),
  demoFilesDir = path.resolve(buildDir, 'demo_files'),
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
        output: path.resolve(buildDir, 'demo_files', 'listings.json'),
        cwd: demoFilesDir
      },
      default: {}
    },
    copy: {
      build: {
        files: [
          {
            expand: true, flatten: true,
            src: [path.resolve(__dirname, 'node_modules/doppiojvm/dist/release/natives/**/*.js')],
            dest: path.resolve(demoFilesDir, 'natives')
          },
          {
            expand: true, flatten: false,
            cwd: path.resolve(__dirname, 'node_modules/doppiojvm'),
            src: ['vendor/**/*'],
            dest: demoFilesDir
          }
        ]
      }
    },
    javac: {
      default: {
        files: [{
          expand: true,
          src: path.resolve(demoFilesDir, '/classes/**/*.java')
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
      'js': {
        files: ['src/js/**/*.ts'],
        tasks: ['webpack-dev-server:watch'],
        options: {
          event: [],
          atBegin: true,
          spawn: true
        }
      },
      'mustache-templates': {
        files: ['src/html/*.mustache'],
        tasks: ['mustache_render:release'],
        options: {
          atBegin: true
        }
      },
      java: {
        files: ['build/demo_files/**/*.java'],
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
      watch: _.extend(webpackConfig, {
        watch: true,
        keepAlive: true
      })
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-webpack');
  // Load our custom tasks.
  grunt.loadTasks('tasks');

  /**
   * PUBLIC-FACING TARGETS BELOW.
   */

  grunt.registerTask('build',
    [
      'find_native_java',
      'javac',
      'mustache_render:release',
      'copy:build',
      'listings',
      'webpack:build'
    ]);

  grunt.registerTask('default', ['build']);
};
