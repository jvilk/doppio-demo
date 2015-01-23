/// <reference path="../vendor/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/gruntjs/gruntjs.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/async/async.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/mustache/mustache.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/glob/glob.d.ts" />
import child_process = require('child_process');
import os = require('os');
import fs = require('fs');
import path = require('path');
import async = require('async');
import glob = require("glob");
var mustache: MustacheStatic = require('mustache');

function render(grunt: IGrunt) {
	grunt.registerMultiTask('render', 'Run the Mustache renderer on input files.', function() {
    var files: {src: string[]; dest: string}[] = this.files,
        done: (status?: boolean) => void = this.async(),
        tasks: Function[] = [],
        options = this.options({ args: [] });
    glob(options.partials,(err: Error, partials: string[]) => {
      async.each(files, (file: {src: string[]; dest: string}, next: (e?: any) => void) => {
        if (!grunt.file.exists(path.dirname(file.dest))) {
          grunt.file.mkdir(path.dirname(file.dest));
        }
        renderFile(file.src[0], partials, file.dest, next);
      },(e?: any) => {
        if (e) {
          grunt.fail.fatal(`Error rendering templates: ${err}`);
        }
        done();
      });
    });
  });
}

function renderFile(templateFile: string, partials: string[], destFile: string, cb: (e?: any) => void) {
  try {
    var template = fs.readFileSync(templateFile).toString(),
      partialContents: { [name: string]: string } = {},
      options: { [name: string]: string } = {};
    partials.forEach((p: string) => {
      partialContents[p] = fs.readFileSync(p).toString();
    });

    child_process.exec('git rev-parse HEAD', (err, stdout, stderr) => {
      if (err) {
        cb(err);
      } else {
        options['git_hash'] = stdout.toString();
        options['git_short_hash'] = stdout.toString().slice(0, 6);
        options['date'] = (new Date()).toLocaleDateString();

        fs.writeFile(destFile, mustache.render(template, options, partials), cb);
      }
    });
  } catch (e) {
    cb(e);
  }
}

export = render;
