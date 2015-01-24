/// <reference path="vendor/DefinitelyTyped/node/node.d.ts" />
/// <reference path="vendor/DefinitelyTyped/gruntjs/gruntjs.d.ts" />
/**
 * Contains all of doppio's grunt build tasks in TypeScript.
 */
import path = require('path');
import fs = require('fs');
import os = require('os');

export function setup(grunt: IGrunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Calls path.resolve with the given arguments. If any argument is a
    // template, it is recursively processed until it no longer contains
    // templates.
    // Why do we need this? See:
    // http://stackoverflow.com/questions/21121239/grunt-how-do-recursive-templates-work
    resolve: function (...segs: string[]): string {
      var fixedSegs: string[] = [];
      segs.forEach(function (seg: string) {
        while (seg.indexOf('<%=') !== -1) {
          seg = <any> grunt.config.process(seg);
        }
        fixedSegs.push(seg);
      });
      return path.resolve.apply(path, fixedSegs);
    },
    // doppio build configuration
    build: {
      // Path to Java CLI utils. Will be updated by find_native_java task
      // if needed.
      java: 'java',
      javap: 'javap',
      javac: 'javac',
      is_java_8: true,
      doppio_dir: __dirname, // Root directory for doppio (same as this file)
      vendor_dir: '<%= resolve(build.doppio_dir, "vendor") %>',
      java_home_dir: '<%= resolve(build.doppio_dir, "vendor", "java_home") %>',
      jcl_dir: '<%= resolve(build.java_home_dir, "classes") %>',
      build_dir: '<%= resolve(build.doppio_dir, "build") %>',
      // TODO: Maybe fix this to prevent us from using too much scratch space?
      scratch_dir: path.resolve(os.tmpdir(), "jdk-download" + Math.floor(Math.random() * 100000))
    },
    listings: {
      options: {
        output: "<%= resolve(build.build_dir, 'demo_files', 'listings.json') %>",
        cwd: "<%= resolve(build.build_dir, 'demo_files') %>"
      },
      default: {}
    },
    // Compiles TypeScript files.
    ts: {
      options: {
        sourcemap: true,
        comments: true,
        declaration: true
        // noImplicitAny: true
      },
      build: {
        src: ["src/js/**/*.ts"],
        outDir: 'build/js'
      }
    },
    // Downloads files.
    'curl-dir': {
      long: {
        src: 'https://github.com/plasma-umass/doppio_jcl/releases/download/v2.0/java_home.tar.gz',
        dest: "<%= build.vendor_dir %>"
      }
    },
    untar: {
      java_home: {
        files: {
          "<%= build.vendor_dir %>": "<%= resolve(build.vendor_dir, 'java_home.tar.gz') %>"
        }
      }
    },
    copy: {
      build: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/img/**/*'],
          dest: '<%= resolve(build.build_dir, "img") %>'
        },
        {
          expand: true, flatten: false,
          src: ['demo_files/**/*'],
          dest: '<%= resolve(build.build_dir) %>'
        },
        {
          expand: true, flatten: true,
          src: ['vendor/jquery.console.js',
            'vendor/browserfs/dist/browserfs.min.*',
            'vendor/doppio/dist/doppio.js'], dest: '<%= resolve(build.build_dir, "js") %>'
        },
        {
          expand: true, flatten: false,
          src: ['websockify/**/*'],
          cwd: 'vendor',
          dest: '<%= resolve(build.build_dir, "js") %>'
        },
        {
          expand: true, flatten: true,
          src: ['vendor/doppio/dist/natives/**/*.js'],
          dest: '<%= resolve(build.build_dir, "demo_files", "natives") %>'
        }]
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
    render: {
      release: {
        options: {
          partials: "src/html/_*.mustache"
        },
        files: [{
          expand: true,
          flatten: true,
          src: "src/html/!(_)*.mustache",
          dest: "<%= build.build_dir %>",
          ext: '.html'
        }]
      }
    },
    concat: {
      default: {
        src: ['vendor/bootstrap/docs/assets/css/bootstrap.css', 'src/css/style.css'],
        dest: '<%= resolve(build.build_dir, "css", "style.css") %>',
      }
    },
    watch: {
      options: {
        // We *need* tasks to share the same context, as setup sets the
        // appropriate 'build' variables.
        spawn: false
      },
      // Monitors TypeScript source in browser/ and src/ folders. Rebuilds
      // CLI and browser builds.
      'ts-source': {
        files: ['src/js/**/*.ts'],
        tasks: []
      },
      'mustache-templates': {
        files: ['src/html/*.mustache'],
        tasks: []
      },
      css: {
        files: ['src/css/*.css'],
        tasks: ['concat']
      },
      java: {
        files: ['src/java/classes/**/*.java'],
        tasks: [
          'javac',
          'copy:build'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-untar');
  // Load our custom tasks.
  grunt.loadTasks('tasks');

  grunt.registerTask('setup', "Sets up doppio's environment prior to building.", function() {
    // Fetch java_home files if it's missing.
    if (!grunt.file.exists(<string> grunt.config.get('build.java_home_dir'))) {
      grunt.log.writeln("Running one-time java_home setup; this could take a few minutes!");
      grunt.task.run(['curl-dir', 'untar', 'delete_jh_tar']);
    }
  });
  grunt.registerTask('delete_jh_tar', "Deletes java_home.tar.gz post-extraction.", function () {
    grunt.file.delete(path.resolve('vendor', 'java_home.tar.gz'));
  });

  /**
   * PUBLIC-FACING TARGETS BELOW.
   */

  grunt.registerTask('build',
    [
      'setup',
      'find_native_java',
      'javac',
      'ts:build',
      'concat',
      'render:release',
      'copy:build',
      'listings'
    ]);

  grunt.registerTask('default', ['build']);

  grunt.registerTask('clean', 'Deletes built files.', function() {
    ['build'].concat(grunt.file.expand(['demo_files/*/*.class'])).forEach(function (path: string) {
      if (grunt.file.exists(path)) {
        grunt.file.delete(path);
      }
    });
    grunt.log.writeln('All built files have been deleted, except for Grunt-related tasks (e.g. tasks/*.js and Grunttasks.js).');
  });
};
