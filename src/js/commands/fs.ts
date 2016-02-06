import {AbstractShellCommand} from './meta';
import Shell from '../shell';
import async = require('async');
import BrowserFS = require('browserfs');
import {columnize, copyFile} from '../util';

import _fs = require('fs');
import Stats = _fs.Stats;

const path = BrowserFS.BFSRequire('path'),
  fs = BrowserFS.BFSRequire('fs'),
  process = BrowserFS.BFSRequire('process');

// helper function for 'ls'
function readDir(dir: string, pretty: boolean, columns: boolean, numCols: number, cb: (listing: string) => void): void {
  fs.readdir(path.resolve(dir), (err: Error, contents: string[]) => {
    if (err || contents.length == 0) {
      return cb('');
    }
    contents = contents.sort();
    if (!pretty) {
      return cb(contents.join('\n'));
    }
    var prettyList: string[] = [];
    async.each(contents,
      // runs on each element
      (c: string, nextItem: () => void) => {
        fs.stat(`${dir}/${c}`, (err: Error, stat?: Stats) => {
          if (err == null) {
            if (stat.isDirectory()) {
              c += '/';
            }
            prettyList.push(c);
          }
          nextItem();
        });
      },
      // runs at the end of processing
      () => {
        if (columns)
          cb(columnize(prettyList, numCols));
        else
          cb(prettyList.join('\n'));
      });
  });
}

export class LSCommand extends AbstractShellCommand {
  public getCommand() {
    return 'ls';
  }
  public run(shell: Shell, args: string[], cb: () => void): void {
    const cols = shell.terminal.maxCols;
    if (args.length === 0) {
      readDir('.', true, true, cols, (listing) => {
        shell.stdout(listing + "\n");
        cb();
      });
    } else if (args.length === 1) {
      readDir(args[0], true, true, cols, (listing) => {
        shell.stdout(listing + "\n");
        cb();
      });
    } else {
      async.each(args, (dir: string, next: () => void) => {
        readDir(dir, true, true, cols, (listing: string) => {
          shell.stdout(`${dir}:\n${listing}\n\n`);
          next();
        });
      }, cb);
    }
  }
}

export class CatCommand extends AbstractShellCommand {
  public getCommand() {
    return 'cat';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args.length == 0) {
      terminal.stdout("Usage: cat <file>\n");
      return cb();
    }
    async.eachSeries(args, (item: string, next: () => void) => {
      fs.readFile(item, 'utf8', function (err: Error, data: string): void {
        if (err) {
          terminal.stderr(`Could not open file '${item}': ${err}\n`);
        } else {
          terminal.stdout(data);
        }
        next();
      });
    }, cb);
  }
}

export class MvCommand extends AbstractShellCommand {
  public getCommand() {
    return 'mv';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args.length < 2) {
      terminal.stdout("Usage: mv <from-file> <to-file>\n");
      return cb();
    }
    // TODO: support mv foo bar someDir/
    fs.rename(args[0], args[1], (err?: Error) => {
      if (err) {
        terminal.stderr(`Could not rename ${args[0]} to ${args[1]}: ${err}\n`);
      }
      cb();
    });
  }
}

export class CpCommand extends AbstractShellCommand {
  public getCommand() {
    return 'cp';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args.length < 2) {
      terminal.stdout("Usage: cp <from-file> <to-file>\n");
      return cb();
    }
    var dest = args.pop();
    // hack around BFS bug: stat('foo/') fails for some reason
    if (dest.lastIndexOf('/') == dest.length-1) {
      dest = dest.substr(0, dest.length-1);
    }
    fs.stat(dest, (err: Error, stat: any) => {
      if (err && (<any>err).code !== 'ENOENT') {
        terminal.stderr(`Invalid destination: ${dest}: ${err}\n`);
        cb();
      } else if (stat != null && stat.isDirectory()) {
        // copy args to dest directory
        async.each(args, (item: string, next: () => void) => {
          copyFile(item, path.resolve(dest, path.basename(item)), (err: Error) => {
            if (err) {
              terminal.stderr(`Copy failed for ${item}: ${err}\n`);
            }
            next();
          });
        }, cb);
      } else if (args.length > 1) {
        terminal.stderr("Too many arguments for file target.\n");
        cb();
      } else if (args[0] == dest) {
        terminal.stderr("Source and target are identical.\n");
        cb();
      } else {
        copyFile(args[0], dest, (err: Error) => {
          if (err) {
            terminal.stderr(`Copy failed: ${err}\n`);
          }
          cb();
        });
      }
    });
  }
}

export class MkdirCommand extends AbstractShellCommand {
  public getCommand() {
    return 'mkdir';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args.length < 1) {
      terminal.stdout("Usage: mkdir <dirname>\n");
      return cb();
    }
    async.each(args, (item: string, next: () => void) => {
      fs.mkdir(item, (err?: Error) => {
        if (err) {
          terminal.stderr(`Could not make directory ${item}: ${err}\n`);
        }
        next();
      });
    }, cb);
  }
}

export class CDCommand extends AbstractShellCommand {
  public getCommand() {
    return 'cd';
  }
  public run(shell: Shell, args: string[], cb: () => void): void {
    if (args.length > 1) {
      shell.stdout("Usage: cd <directory>\n");
      cb();
    } else {
      var dir: string;
      if (args.length == 0 || args[0] == '~') {
        // Change to the default (starting) directory.
        dir = '/home';
      } else {
        dir = path.resolve(args[0]);
      }
      // Verify path exists before going there.
      // chdir does not verify that the directory exists.
      fs.exists(dir, (doesExist: boolean) => {
        if (doesExist) {
          process.chdir(dir);
          shell.updatePS();
        } else {
          shell.stderr(`Directory ${dir} does not exist.\n`);
        }
        cb();
      });
    }
  }
}

export class RMCommand extends AbstractShellCommand {
  public getCommand() {
    return 'rm';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args[0] == null) {
      terminal.stdout("Usage: rm <file>\n");
      cb();
    } else {
      async.each(args, (item: string, next: () => void) => {
        fs.unlink(item, (err?: Error) => {
          if (err) {
            terminal.stderr(`Could not remove file ${item}: ${err}\n`);
          }
          next();
        });
      }, cb);
    }
  }
}

export class RmdirCommand extends AbstractShellCommand {
  public getCommand() {
    return 'rmdir';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    if (args[0] == null) {
      terminal.stdout("Usage: rmdir <dir>\n");
      cb();
    } else {
      async.each(args, (item: string, next: () => void) => {
        fs.rmdir(item, (err?: Error) => {
          if (err) {
            terminal.stderr(`Could not remove directory ${item}: ${err}\n`);
          }
          next();
        });
      }, cb);
    }
  }
}

export class MountDropboxCommand extends AbstractShellCommand {
  public getCommand() {
    return 'mount_dropbox';
  }

  public getAutocompleteFilter() {
    // takes no completable arguments
    return () => false;
  }

  public run(terminal: Shell, args: string[], cb: () => void): void {
    var api_key: string = "j07r6fxu4dyd08r";
    if (args.length < 1 || args[0] !== 'Y') {
      terminal.stdout(
`This command may redirect you to Dropbox's site for authentication.
If you would like to proceed with mounting Dropbox into the in-browser
filesystem, please type "mount_dropbox Y".

Once you have successfully authenticated with Dropbox and the page reloads,
you will need to type "mount_dropbox Y" again to finish mounting.
(If you would like to use your own API key, please type "mount_dropbox Y your_api_key_here".)\n`);
      cb();
    } else {
      if (args.length == 2 && args[1].length === 15) {
        api_key = args[1];
        terminal.stdout(`Using API key ${api_key}...\n`);
      }
      var client = new Dropbox.Client({ key: api_key });
      client.authenticate((error: any, data?: any): void => {
        if (!error) {
          let mfs = <BrowserFS.FileSystem.MountableFileSystem> fs.getRootFS();
          mfs.mount('/mnt/dropbox', new (<any>BrowserFS).FileSystem.Dropbox(client));
          terminal.stdout("Successfully connected to your Dropbox account. You can now access files in the /Apps/DoppioJVM folder of your Dropbox account at /mnt/dropbox.\n");
        } else {
          terminal.stderr(`Unable to connect to Dropbox: ${error}\n`);
        }
        cb();
      });
    }
  }
}
