///<reference path="../typings/main.d.ts" />
import fs = require('fs');

function listings(grunt: IGrunt) {
	grunt.registerMultiTask('listings', 'Generates listings.json', function() {
    var done: (status?: boolean) => void = this.async(),
      cwd = process.cwd(),
      options = this.options();

    // Make sure that `programs` folder exists.
    grunt.util.spawn({
      cmd: 'mkdir',
      args: ['-p', options.cwd]
    }, function(error: Error, result: grunt.util.ISpawnResult, code: number) {
      if (code !== 0 || error) {
        grunt.fail.fatal("Error creating needed directory for listings.json: " + result.stderr + error);
      }

      grunt.util.spawn({
        cmd: 'node',
        args: [`${cwd}/node_modules/coffee-script/bin/coffee`, `${cwd}/node_modules/browserfs/tools/XHRIndexer.coffee`],
        opts: {cwd: options.cwd}
      }, function(error: Error, result: grunt.util.ISpawnResult, code: number) {
        if (code !== 0 || error) {
          grunt.fail.fatal("Error generating listings.json: " + result.stderr + error);
        }
        fs.writeFileSync(options.output, result.stdout);
        done();
      });
    });
  });
}

export = listings;
