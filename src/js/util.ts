import _fs = require('fs');
import Stats = _fs.Stats;
import _ = require('underscore');
import async = require('async');

import BrowserFS = require('browserfs');

const path = BrowserFS.BFSRequire('path'),
  fs = BrowserFS.BFSRequire('fs');

export function filterSubstring(prefix: string, lst: string[]): string[] {
  return lst.filter((x) => x.substr(0, prefix.length) == prefix);
}

/**
 * Asynchronous method for processing a Unix glob.
 */
export function processGlob(glob: string, cb: (expansion: string[]) => void): void {
  var globNormalized: string = path.normalize(glob),
      pathComps: string[] = globNormalized.split('/'),
      // We bootstrap the algorithm with '/' or '.', depending on whether or not
      // the glob is a relative or absolute path.
      expanded: string[] = [glob.charAt(0) === '/' ? '/' : '.'];

  /**
   * Constructs a regular expression for a given glob pattern.
   */
  function constructRegExp(pattern: string): RegExp {
    return new RegExp("^" + pattern.replace(/\./g, "\\.").split('*').join('[^/]*') + "$");
  }

  // Process each component of the path separately.
  async.eachSeries(pathComps, function(path_comp: string, next_item: (e?: any) => void): void {
    var r: RegExp;
    if (path_comp === "") {
      // This condition occurs for:
      // * The first component in an absolute directory.
      // * The last component in a path that ends in '/' (normalize doesn't remove it).
      return next_item();
    }
    r = constructRegExp(path_comp);
    expandDirs(expanded, r, function(_expanded: string[]): void {
      expanded = _expanded;
      next_item();
    });
  }, (e?: any) => {
    cb(expanded);
  });
}

/**
 * Calls `readdir` on each directory, and ignores any files in `dirs`.
 * Tests the result against the regular expression.
 * Passes back any directories that pass the test.
 */
function expandDirs(dirs: string[], r: RegExp, cb: (expansion: string[]) => void): void {
  var expanded: string[] = [];
  async.each(dirs, (dir: string, next_item: () => void): void => {
    fs.readdir(dir, (err: any, contents?: string[]): void => {
      var i: number;
      if (err == null) {
        for (i = 0; i < contents.length; i++) {
          if (r.test(contents[i])) {
            // Note: We don't 'resolve' because we don't want the path to become
            // absolute if it was relative in the first place.
            expanded.push(path.join(dir, contents[i]));
          }
        }
      }
      next_item();
    });
  }, () => {
    cb(expanded);
  });
}

export function fileNameCompletions(cmd: string, args: string[],
                             filter: (item: string, isDir: boolean)=>boolean,
                             cb: (c: string[])=>void): void {
  var toComplete = _.last(args);
  var lastSlash = toComplete.lastIndexOf('/');
  var dirPfx: string, searchPfx: string;
  if (lastSlash >= 0) {
    dirPfx = toComplete.slice(0, lastSlash + 1);
    searchPfx = toComplete.slice(lastSlash + 1);
  } else {
    dirPfx = '';
    searchPfx = toComplete;
  }
  var dirPath = (dirPfx == '') ? '.' : path.resolve(dirPfx);
  fs.readdir(dirPath, function(err: Error, dirList: string[]){
    var completions: string[] = [];
    if (err != null) {
      return cb(completions)
    }
    dirList = filterSubstring(searchPfx, dirList);
    async.each(dirList,
      // runs on each element
      (item: string, next: () => void) => {
        fs.stat(path.resolve(dirPfx + item), function(err: Error, stats: Stats) {
          if (err != null) {
            // Do nothing.
          } else if (stats.isDirectory() && filter(item, true)) {
            completions.push(dirPfx + item + '/');
          } else if (filter(item, false)) {
            completions.push(dirPfx + item);
          }
          next();
        });
      },
      // runs at the end of processing
      () => cb(completions));
  });
}

// use the awesome greedy regex hack, from http://stackoverflow.com/a/1922153/10601
export function longestCommmonPrefix(lst: string[]): string {
  return lst.join(' ').match(/^(\S*)\S*(?: \1\S*)*$/i)[1];
}

export function columnize(str_list: string[], line_length: number): string {
  var max_len = 0;
  for (var i = 0; i < str_list.length; i++) {
    var len = str_list[i].length;
    if (len > max_len) {
      max_len = len;
    }
  }
  var num_cols = (line_length / (max_len + 1)) | 0;
  var col_size = Math.ceil(str_list.length / num_cols);
  var column_list: string[][] = [];
  for (var j = 1; j <= num_cols; j++) {
    column_list.push(str_list.splice(0, col_size));
  }
  function make_row(i: number): string {
    return column_list.filter((col)=>col[i]!=null)
                      .map((col)=>padRight(col[i], max_len + 1))
                      .join('');
  }
  var row_list: string[] = [];
  for (var i = 0; i < col_size; i++) {
    row_list.push(make_row(i));
  }
  return row_list.join('\n');
}

export function padRight(str: string, len: number): string {
  return str + Array(len - str.length + 1).join(' ');
}

export function recursiveRm(dir: string, progressCb: (file: string) => void, cb: (err?: any) => void): void {
  function processDir(folder: string, cb: (err?: any) => void): void {
    fs.readdir(folder, (err, items) => {
      if (err) {
        return cb(err);
      }
      async.each(items, (item: string, next: (err?: any) => void) => {
        const p = path.resolve(folder, item);
        fs.stat(p, (e, stat) => {
          if (e) {
            next(e);
          } else {
            if (stat.isDirectory()) {
              processDir(p, (e) => {
                if (!e) {
                  fs.rmdir(p, next);
                } else {
                  next(e);
                }
              });;
            } else {
              progressCb(p);
              fs.unlink(p, next);
            }
          }
        });
      }, cb);
    });
  }
  processDir(dir, cb);
}

export function recursiveCopy(srcFolder: string, destFolder: string, progressCb: (src: string, dest: string, size: Stats) => void, cb: (err?: any) => void): void {
  function processDir(srcFolder: string, destFolder: string, cb: (err?: any) => void) {
    fs.mkdir(destFolder, (err?: NodeJS.ErrnoException) => {
      // Ignore EEXIST.
      if (err && err.code !== 'EEXIST') {
        cb(err);
      } else {
        fs.readdir(srcFolder, (e: NodeJS.ErrnoException, items: string[]) => {
          if (e) {
            cb(e);
          } else {
            async.each(items, (item: string, next: (err?: any) => void) => {
              var srcItem = path.resolve(srcFolder, item),
                destItem = path.resolve(destFolder, item);
              fs.stat(srcItem, (e: NodeJS.ErrnoException, stat?: Stats) => {
                if (e) {
                  cb(e);
                } else {
                  if (stat.isDirectory()) {
                    processDir(srcItem, destItem, next);
                  } else {
                    progressCb(srcItem, destItem, stat);
                    copyFile(srcItem, destItem, next);
                  }
                }
              });
            }, cb);
          }
        });
      }
    });
  }

  processDir(srcFolder, destFolder, cb);
}

export function copyFile(srcFile: string, destFile: string, cb: (err?: any) => void) {
  fs.readFile(srcFile, (e: any, data?: Buffer) => {
    if (e) {
      cb(e);
    } else {
      fs.writeFile(destFile, data, cb);
    }
  });
}

// Adapted from http://stackoverflow.com/a/4770179
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const keys: {[key: number]: number} = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1};

function preventDefault(e: Event): void {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e: KeyboardEvent): boolean | void {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

export function disableScroll(element: HTMLElement): void {
  if (element.addEventListener) {
    element.addEventListener('DOMMouseScroll', preventDefault, false);
  }
//  element.onwheel = preventDefault; // modern standard
//  element.onmousewheel = preventDefault; // older browsers, IE
// element.ontouchmove  = preventDefault; // mobile
  // element.onkeydown  = preventDefaultForScrollKeys;
}

export function enableScroll(element: HTMLElement): void {
  if (element.removeEventListener) {
    element.removeEventListener('DOMMouseScroll', preventDefault, false);
  }
  element.onmousewheel = null;
  element.onwheel = null;
  element.ontouchmove = null;
  // element.onkeydown = null;
}
