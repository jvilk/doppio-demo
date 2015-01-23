/// <reference path="../vendor/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/gruntjs/gruntjs.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/async/async.d.ts" />
import child_process = require('child_process');
import os = require('os');
import fs = require('fs');
import async = require('async');
/**
 * Helper function: If string is a path with spaces in it, surround it with
 * quotes.
 */
function shellEscape(str: string): string {
  return str.indexOf(' ') !== -1 ? '"' + str + '"' : str;
}

/**
 * Java-related tasks.
 */
function java(grunt: IGrunt) {
  grunt.registerMultiTask('javac', 'Run javac on input files.', function() {
    var files: {src: string[]; dest: string}[] = this.files,
        inputFiles: string[] = [],
        done: (status?: boolean) => void = this.async();
    grunt.config.requires('build.javac');
      files.forEach(function (e: { src: string[]; dest: string }) {
      var dest = e.src[0].slice(0, -4) + 'class';
      if (fs.existsSync(dest) && fs.statSync(dest).mtime > fs.statSync(e.src[0]).mtime) {
        // No need to process file.
        return;
      }
      inputFiles = inputFiles.concat(e.src);
    });
    if (inputFiles.length === 0) {
      return done();
    }
    child_process.exec(shellEscape(grunt.config('build.javac')) + ' -bootclasspath ' + grunt.config('build.jcl_dir') + ' -source 1.8 -target 1.8 ' + inputFiles.join(' '), function(err?: any) {
      if (err) {
        grunt.fail.fatal('Error running javac: ' + err);
      }
      done();
    });
  });
}

export = java;
