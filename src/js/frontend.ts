/// <reference path="../../vendor/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../../vendor/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../../vendor/jquery.console.d.ts" />
/// <reference path="../../vendor/DefinitelyTyped/ace/ace.d.ts" />
/// <reference path="../../vendor/DefinitelyTyped/underscore/underscore.d.ts" />
/// <reference path="../../vendor/DefinitelyTyped/dropboxjs/dropboxjs.d.ts" />
/// <reference path="../../vendor/DefinitelyTyped/async/async.d.ts" />
declare var BrowserFS: {
  BFSRequire(name: 'process'): NodeJS.Process;
  BFSRequire(name: 'buffer'): { Buffer: typeof Buffer };
  BFSRequire(name: string): any;
};

declare var doppio: {
  javaCli: {
    java(args: string[], opts: any, cb: (arg: boolean) => void,
      startedCb?: (jvm: any) => void): void;
  }
};

// Add the .files attr for FileReader event targets.
interface FileReaderEvent extends ErrorEvent {
  target: FileReaderEventTarget;
}
interface FileReaderEventTarget extends EventTarget {
  files: File[];
  error: any;
}

interface TerminalCommand {
  getCommand(): string;
  getAutocompleteFilter(): (fname: string) => boolean;
  run(terminal: Terminal, args: string[], cb: () => void): void;
}

/**
 * Abstracts away the messiness of JQConsole.
 */
class Terminal {
  private _console: JQConsole = null;
  private _consoleElement: JQuery;
  private _commands: { [command: string]: TerminalCommand } = {};

  constructor(consoleElement: JQuery, commands: TerminalCommand[], welcomeMessage: string) {
    this._consoleElement = consoleElement;
    commands.forEach((c: TerminalCommand) => {
      this._commands[c.getCommand()] = c;
    });

    this._console = consoleElement.console({
      promptLabel: ps1(),
      commandHandle: (line: string): any => {
        var parts = line.trim().split(/\s+/);
        this.runCommand(parts);
        return null;
      },
      cancelHandle: (): void => {
        // XXX: Need a 'currentcommand' that I can cancel.
      },
      tabComplete: () => {
        // tabComplete;
      },
      autofocus: false,
      animateScroll: true,
      promptHistory: true,
      welcomeMessage: welcomeMessage,
    });
  }
  public stdout(text: string): void {
    this._console.message(text, 'success', false);
  }
  public stderr(text: string): void {
    this._console.message(text, 'error', false);
  }
  public stdin(cb: (text: string) => void): void {
    var console = this._console,
      oldPrompt = console.promptLabel,
      oldHandle = console.commandHandle;
    console.promptLabel = '';
    // Reprompt with a temporary custom handler.
    console.reprompt();
    console.commandHandle = (line: string) => {
      console.commandHandle = oldHandle;
      console.promptLabel = oldPrompt;
      if (line === '\0') {
        // EOF
        cb(line);
      } else {
        line += "\n";  // so BufferedReader knows it has a full line
        cb(line);
      }
    };
  }
  public runCommand(args: string[]) {
    var command = this._commands[args[0]];
    if (command === undefined) {
      this.stderr(`Unknown command ${args[0]}. Type "help" for a list of commands.`);
      this.exitProgram();
    } else {
      command.run(this, args.slice(1), () => {
        this.exitProgram();
      });
    }
  }
  public exitProgram(): void {
    this._console.reprompt();
    this._consoleElement.click();
  }
  public getPromptText(): string {
    return this._console.promptLabel;
  }
  public setPromptText(text: string): void {
    this._console.promptLabel = text;
  }
  public getAvailableCommands(): { [commandName: string]: TerminalCommand } {
    return _.clone(this._commands);
  }
  private _expandArguments(args: string[], cb: (expandedArgs: string[]) => void) {
    var expandedArgs: string[] = [];
    async.each(args,(arg: string, cb: (e?: any) => void) => {
      processGlob(arg, (expansionTerms: string[]) => {
        expandedArgs = expandedArgs.concat(expansionTerms);
        cb();
      });
    },(e?: any) => {
        cb(expandedArgs);
    });
  }
}

class AbstractTerminalCommand implements TerminalCommand {
  public getCommand(): string {
    throw new Error("Abstract method.");
  }
  public getAutocompleteFilter() {
    return () => true;
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    throw new Error("Abstract method");
  }
}



var process: NodeJS.Process = BrowserFS.BFSRequire('process'),
  Buffer = BrowserFS.BFSRequire('buffer').Buffer,
  fs = BrowserFS.BFSRequire('fs'),
  path = BrowserFS.BFSRequire('path'),
  demoJars = "/home/jars/",
  demoClasses = "/home/classes/";

/**
 * Construct a JavaOptions object with the default demo fields filled in.
 * Optionally merge it with the custom arguments specified.
 */
function constructJavaOptions(customArgs: { [prop: string]: any } = {}) {
  return _.extend({
    bootstrapClasspath: ['/sys/vendor/java_home/classes'],
    classpath: [],
    javaHomePath: '/sys/vendor/java_home',
    extractionPath: '/jars',
    nativeClasspath: ['/sys/src/natives'],
    assertionsEnabled: false
  }, customArgs);
}

/**
 * Maintain the size of the console.
 */
function onResize(): void {
  var height = $(window).height() * 0.7;
  $('#console').height(height);
  $('#source').height(height);
}

// Returns prompt text, ala $PS1 in bash.
function ps1(): string {
  return `${process.cwd() }$ `;
}



/**
 * Uploads the specified file via the FileReader interface. Calls the callback
 * with an optional error if one occurs.
 */
function uploadFile(f: File, cb: (e?: string) => void) {
  var reader = new FileReader();
  reader.onerror = (e: FileReaderEvent): void => {
    switch (e.target.error.code) {
      case e.target.error.NOT_FOUND_ERR:
        return cb(`File ${f.name} not found.`);
      case e.target.error.NOT_READABLE_ERR:
        return cb(`File ${f.name} is not readable.`);
      case e.target.error.SECURITY_ERR:
        return cb("Cannot use the FileReader interface. You must launch your browser with --allow-file-access-from-files.");
    }
  };
  reader.onload = (e) => {
    fs.writeFile(process.cwd() + '/' + f.name, new Buffer((<any> e.target).result),(err: Error) => {
      if (err) {
        cb(`${err}`);
      } else {
        cb();
      }
    });
  };
  reader.readAsArrayBuffer(f);
}

/**
 * Upload files via the browser's FileReader interface. Triggered when someone
 * clicks the upload button in the demo.
 */
function uploadFiles(terminal: Terminal, ev: FileReaderEvent) {
  if (typeof FileReader === "undefined" || FileReader === null) {
    terminal.stderr("Your browser doesn't support file loading.\nTry using the editor to create files instead.");
    return terminal.exitProgram();
  }
  var fileCount = ev.target.files.length, filesUploaded = 0;
  if (fileCount > 0) {
    terminal.stdout(`Uploading ${fileCount} files...\n`);
  }

  var files = ev.target.files;
  files.forEach((f: File) => {
    uploadFile(f,(e?) => {
      filesUploaded++;
      var str = `[${filesUploaded}/${fileCount}]: File ${f.name} `
      if (e) {
        str += `could not be saved: ${e}.\n`;
        terminal.stderr(str);
      } else {
        str += "successfully saved.\n";
        terminal.stdout(str);
      }

      if (filesUploaded === fileCount) {
        terminal.exitProgram();
      }
    });
  });
}

// TODO: Download file locally command.

$(window).resize(onResize);
$(document).ready(() => {
  // Set up initial size of the console.
  onResize();
  // Put the user in the tmpfs.
  process.chdir('/tmp');
  // Set up the master terminal object.
  fs.readFile("/sys/helptext.txt",(e, data: Buffer) => {
    var welcomeText = "";
    if (!e) {
      welcomeText = data.toString();
    }
    var terminal = new Terminal($('#console'), [
      new JARCommand('ecj', demoJars + "ecj.jar", ['-Djdt.compiler.useSingleThread=true']),
      new JARCommand('rhino', demoJars + "rhino.jar"),
      new JavaClassCommand('javac', demoClasses, "classes.util.Javac"),
      new JavaClassCommand('javap', demoClasses, "classes.util.Javap"),
      new JavaCommand(),
      new LSCommand(),
      new EditCommand('source', $('#save_btn'), $('#close_btn'), $('#ide'), $('#console'), $('#filename')),
      new CatCommand(),
      new MvCommand(),
      new MkdirCommand(),
      new CDCommand(),
      new RMCommand(),
      new MountDropboxCommand(),
      new TimeCommand(),
      new ProfileCommand(),
      new HelpCommand()
    ], welcomeText);

    // set up the local file loaders
    $('#file').change((ev: FileReaderEvent) => {
      uploadFiles(terminal, ev);
    });

    // Set up stdout/stderr/stdin.
    process.stdout.on('data',(data: Buffer) => terminal.stdout(data.toString()));
    process.stderr.on('data',(data: Buffer) => terminal.stderr(data.toString()));
    process.stdin.on('_read',() => {
      terminal.stdin((text: string) => {
        // BrowserFS's stdin lets you write to it for emulation purposes.
        (<NodeJS.ReadWriteStream> process.stdin).write(new Buffer(text));
      });
    });

    // Focus the terminal.
    $('#console').click();
  });
});

function pad_right(str: string, len: number): string {
  return str + Array(len - str.length + 1).join(' ');
}

// helper function for 'ls'
function readDir(dir: string, pretty: boolean, columns: boolean, cb: (listing: string) => void): void {
  fs.readdir(path.resolve(dir), (err: Error, contents: string[]) => {
    if (err || contents.length == 0) {
      return cb('');
    }
    contents = contents.sort();
    if (!pretty) {
      return cb(contents.join('\n'));
    }
    var pretty_list: string[] = [];
    async.each(contents,
      // runs on each element
      (c: string, next_item) => {
        fs.stat(dir + '/' + c, function(err: Error, stat) {
          if (err == null) {
            if (stat.isDirectory()) {
              c += '/';
            }
            pretty_list.push(c);
          }
          next_item();
        });
      },
      // runs at the end of processing
      () => {
        if (columns)
          cb(columnize(pretty_list));
        else
          cb(pretty_list.join('\n'));
      });
  });
}

function columnize(str_list: string[], line_length: number = 100): string {
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
                      .map((col)=>pad_right(col[i], max_len + 1))
                      .join('');
  }
  var row_list: string[] = [];
  for (var i = 0; i < col_size; i++) {
    row_list.push(make_row(i));
  }
  return row_list.join('\n');
}

// Set the origin location, if it's not already.
if (location['origin'] == null) {
  location['origin'] = location.protocol + "//" + location.host;
}

class JavaCommand extends AbstractTerminalCommand {
  public getCommand(): string {
    return "java";
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    doppio.javaCli.java(args, constructJavaOptions({
      launcherName: this.getCommand()
    }), cb);
  }
}

class JARCommand extends JavaCommand {
  private _cmd: string;
  private _jarPath: string;
  private _extraArgs: string[];
  constructor(cmd: string, jarPath: string, extraArgs: string[] = []) {
    super();
    this._cmd = cmd;
    this._jarPath = jarPath;
    this._extraArgs = extraArgs;
  }
  public getCommand() {
    return this._cmd;
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var allArgs = ["-jar", this._jarPath].concat(this._extraArgs, args);
    super.run(terminal, allArgs, cb);
  }
}


class JavaClassCommand extends JavaCommand {
  private _cmd: string;
  private _classpath: string;
  private _className: string;
  private _extraArgs: string[];
  constructor(cmd: string, classpath: string, className: string, extraArgs: string[] = []) {
    super();
    this._cmd = cmd;
    this._classpath = classpath;
    this._className = className;
    this._extraArgs = extraArgs;
  }
  public getCommand() {
    return this._cmd;
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var allArgs = ["-cp", `.:${this._classpath}`, this._className].concat(this._extraArgs, args);
    super.run(terminal, args, cb);
  }
}

class SimpleCommand extends AbstractTerminalCommand {
  private _command: string;
  private _runCommand: (terminal: Terminal, args: string[], cb: () => void) => void;
  constructor(command: string, runCommand: (terminal: Terminal, args: string[], cb: () => void) => void) {
    super();
    this._command = command;
    this._runCommand = runCommand;
  }
  public getCommand() {
    return this._command;
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    this._runCommand(terminal, args, cb);
  }
}

class LSCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'ls';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    if (args.length === 0) {
      readDir('.', true, true,(listing) => {
        terminal.stdout(listing + "\n");
        cb();
      });
    } else if (args.length === 1) {
      readDir(args[0], true, true,(listing) => {
        terminal.stdout(listing + "\n");
        cb();
      });
    } else {
      async.each(args, (dir: string, next: () => void) => {
        readDir(dir, true, true,(listing: string) => {
          terminal.stdout(`${dir}:\n${listing}\n\n`);
          next();
        });
      }, cb);
    }
  }
}

class EditCommand extends AbstractTerminalCommand {
  private _consoleElement: JQuery;
  private _filenameElement: JQuery;
  private _editorContainer: JQuery;
  private _saveButtonElement: JQuery;
  private _closeButtonElement: JQuery;
  private _editor: AceAjax.Editor;
  private _isInitialized: boolean = false;
  constructor(editorElementName: string, saveButtonElement: JQuery, closeButtonElement: JQuery, editorContainer: JQuery, consoleElement: JQuery, filenameElement: JQuery) {
    super();
    this._consoleElement = consoleElement;
    this._filenameElement = filenameElement;
    this._editorContainer = editorContainer
    this._saveButtonElement = saveButtonElement;
    this._closeButtonElement = closeButtonElement;

    // Initiaize AceEdit.
    this._editor = ace.edit(editorElementName);
    this._editor.setTheme('ace/theme/twilight');
  }

  private initialize(terminal: Terminal) {
    if (!this._isInitialized) {
      this._saveButtonElement.click((e: JQueryEventObject) => {
        var fname = this._filenameElement.val();
        var contents = this._editor.getSession().getValue();
        if (contents[contents.length - 1] !== '\n') {
          contents += '\n';
        }
        fs.writeFile(fname, contents,(err: Error) => {
          if (err) {
            terminal.stderr(`File could not be saved: ${err}`);
          } else {
            terminal.stdout(`File saved as '${fname}'.`);
          }
        });
        this.closeEditor(() => { });
        e.preventDefault();
      });
      this._closeButtonElement.click((e: JQueryEventObject) => {
        this.closeEditor(() => { });
        e.preventDefault();
      });
    }
  }

  private closeEditor(cb: () => void) {
    this._editorContainer.fadeOut('fast', () => {
      // click to restore focus
      this._consoleElement.fadeIn('fast').click();
      cb();
    });
  }

  public getCommand() {
    return "edit";
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    this.initialize(terminal);

    function startEditor(data: string): void {
      this._consoleElement.fadeOut('fast', function (): void {
        this._filenameElement.val(args[0]);
        this._editorElement.fadeIn('fast');
        if (args[0] == null || args[0].split('.')[1] === 'java') {
          var JavaMode = ace.require("ace/mode/java").Mode;
          this._editor.getSession().setMode(new JavaMode);
        } else {
          var TextMode = ace.require("ace/mode/text").Mode;
          this._editor.getSession().setMode(new TextMode);
        }
        this._editor.getSession().setValue(data);
      });
    }
    if (args[0] == null) {
      startEditor(defaultFile('Test.java'));
      cb();
    } else {
      fs.readFile(args[0], 'utf8',(err: Error, data: string): void => {
        if (err) {
          startEditor(defaultFile(args[0]));
        } else {
          startEditor(data);
        }
        cb();
      });
    }
  }
}

class CatCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'cat';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var fname = args[0];
    if (fname == null) {
      terminal.stdout("Usage: cat <file>\n");
      cb();
    } else {
      fs.readFile(fname, 'utf8', function (err: Error, data: string): void {
        if (err) {
          terminal.stderr(`Could not open file '${fname}': ${err}`);
        } else {
          terminal.stdout(data + "\n");
        }
        cb();
      });
    }
  }
}

class MvCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'mv';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    if (args.length < 2) {
      terminal.stdout("Usage: mv <from-file> <to-file>\n");
      cb();
    } else {
      fs.rename(args[0], args[1], (err?: Error) => {
        if (err) {
          terminal.stderr(`Could not rename ${args[0]} to ${args[1]}: ${err}\n`);
        }
        cb();
      });
    }
  }
}

class MkdirCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'mkdir';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    if (args.length < 1) {
      terminal.stdout("Usage: mkdir <dirname>\n");
      cb();
    } else {
      fs.mkdir(args[0], (err?: Error) => {
        if (err) {
          terminal.stderr(`Could not make directory ${args[0]}.\n`);
        }
        cb();
      });
    }
  }
}

class CDCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'cd';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    if (args.length > 1) {
      terminal.stdout("Usage: cd <directory>\n");
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
          terminal.setPromptText(ps1());
        } else {
          terminal.stderr(`Directory ${dir} does not exist.\n`);
        }
        cb();
      });
    }
  }
}

class RMCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'rm';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    if (args[0] == null) {
      terminal.stdout("Usage: rm <file>\n");
      cb();
    } else {
      var completed = 0;
      function removeFile(file: string, total: number): void {
        fs.unlink(file, (err?: Error) => {
          if (err) {
            terminal.stderr(`Could not remove file ${file}: ${err}\n`);
          }
          if (++completed == total) {
            cb();
          }
        });
      }
      if (args[0] === '*') {
        fs.readdir('.', function (err: Error, fnames: string[]) {
          if (err) {
            terminal.stderr(`Could not read '.': ${err}\n`);
            cb();
          } else {
            for (var i = 0; i < fnames.length; i++) {
              removeFile(fnames[i], fnames.length);
            }
          }
        });
      } else {
        removeFile(args[0], 1);
      }
    }
  }
}

class MountDropboxCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'mount_dropbox';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var api_key: string = "j07r6fxu4dyd08r";
    if (args.length < 1 || args[0] !== 'Y') {
      terminal.stdout(
`This command may redirect you to Dropbox's site for authentication.
If you would like to proceed with mounting Dropbox into the in-browser
filesystem, please type "mount_dropbox Y".

Once you have successfully authenticated with Dropbox and the page reloads,
you will need to type "mount_dropbox Y" again to finish mounting.
(If you would like to use your own API key, please type "mount_dropbox Y your_api_key_here".)`);
      cb();
    } else {
      if (args.length == 2 && args[1].length === 15) {
        api_key = args[1];
        terminal.stdout(`Using API key ${api_key}...`);
      }
      var client = new Dropbox.Client({ key: api_key });
      client.authenticate((error: any, data?: any): void => {
        var mfs;
        if (error == null) {
          mfs = (<any>fs).getRootFS();
          mfs.mount('/mnt/dropbox', new (<any>BrowserFS).FileSystem.Dropbox(client));
          terminal.stdout("Successfully connected to your Dropbox account. You can now access files in the /Apps/DoppioJVM folder of your Dropbox account at /mnt/dropbox.");
        } else {
          terminal.stderr(`Unable to connect to Dropbox: ${error}`);
        }
        cb();
      });
    }
  }
}

class TimeCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'time';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var command = args[0],
      commandObj = terminal.getAvailableCommands()[command];

    if (command === undefined) {
      terminal.stderr(`Undefined command: ${command}\n`);
      cb();
    } else {
      var start = (new Date).getTime();
      console.profile(command);
      commandObj.run(terminal, args.slice(1), () => {
        console.profileEnd();
        var end = (new Date).getTime();
        terminal.stdout(`\nTime elapsed: ${end - start} ms.`);
        cb();
      });
    }
  }
}

class ProfileCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'profile';
  }
  public run(terminal: Terminal, args: string[], cb: () => void): void {
    var count = 0, runs = 5, duration = 0, command = args[0],
      commandObj = terminal.getAvailableCommands()[command];
    if (commandObj === undefined) {
      terminal.stdout(`Undefined command: ${command}`);
      cb();
    } else {
      function timeOnce(isWarmup: boolean): void {
        var start = (new Date).getTime();
        commandObj.run(terminal, args.slice(1),() => {
          if (!isWarmup) {
            var end = (new Date).getTime();
            duration += end - start;
          }
          if (count < runs) {
            timeOnce(false);
          } else {
            terminal.stdout(`\n${command} took an average of ${duration / runs} ms to run.\n`);
            cb();
          }
        });
      }
      timeOnce(true);
    }
  }
}

class HelpCommand extends AbstractTerminalCommand {
  public getCommand() {
    return 'help';
  }

  public run(terminal: Terminal, args: string[], cb: () => void): void {
    "Ctrl-D is EOF.\n\n" +
    "Java-related commands:\n" +
    "  javac <source file>     -- Invoke the Java 6 compiler.\n" +
    "  java <class> [args...]  -- Run with command-line arguments.\n" +
    "  javap [args...] <class> -- Run the Java 6 disassembler.\n" +
    "  time                    -- Measure how long it takes to run a command.\n" +
    "  rhino                   -- Run Rhino, the Java-based JavaScript engine.\n\n" +
    "File management:\n" +
    "  cat <file>              -- Display a file in the console.\n" +
    "  edit <file>             -- Edit a file.\n" +
    "  ls <dir>                -- List files.\n" +
    "  mv <src> <dst>          -- Move / rename a file.\n" +
    "  rm <file>               -- Delete a file.\n" +
    "  mkdir <dir>             -- Create a directory.\n" +
    "  cd <dir>                -- Change current directory.\n" +
    "  mount_dropbox           -- Mount a Dropbox folder into the file system.\n\n";
  }
}

function tabComplete(terminal: Terminal, args: string[], filter: (item: string) => void): void {
  var promptText = terminal.getPromptText();
  var lastArg = _.last(args);
  getCompletions(terminal, args, filter, (completions: string[]) => {
    var prefix = longestCommmonPrefix(completions);
    if (prefix == '' || prefix == lastArg) {
      // We've no more sure completions to give, so show all options.
      var commonLen = lastArg.lastIndexOf('/') + 1;
      var options = columnize(completions.map((c) => c.slice(commonLen)));
      terminal.stdout(options);
      terminal.setPromptText(promptText);
      return;
    }
    // Delete existing text so we can do case correction.
    promptText = promptText.substr(0, promptText.length -  lastArg.length);
    terminal.setPromptText(promptText + prefix);
  });
}

function getCompletions(terminal: Terminal, args: string[], filter: (item: string) => void, cb: (c: string[]) => void): void {
  if (args.length == 1) {
    cb(filterSubstring(args[0], Object.keys(terminal.getAvailableCommands())));
  } else if (args[0] === 'time') {
    getCompletions(terminal, args.slice(1), filter, cb);
  } else {
    fileNameCompletions(args[0], args, filter, cb);
  }
}

function filterSubstring(prefix: string, lst: string[]): string[] {
  return lst.filter((x) => x.substr(0, prefix.length) == prefix);
}

function fileNameCompletions(cmd: string, args: string[], filter: (item: string) => void, cb: (c: string[])=>void): void {
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
        fs.stat(path.resolve(dirPfx + item), function(err: Error, stats) {
          if (err != null) {
            // Do nothing.
          } else if (stats.isDirectory()) {
            completions.push(dirPfx + item + '/');
          } else if (filter(item)) {
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
function longestCommmonPrefix(lst: string[]): string {
  return lst.join(' ').match(/^(\S*)\S*(?: \1\S*)*$/i)[1];
}

function defaultFile(filename: string): string {
  if (filename.indexOf('.java', filename.length - 5) != -1) {
    return
`class ${filename.substr(0, filename.length - 5)} {
  public static void main(String[] args) {
    // enter code here
  }
}`;
  }
  return "";
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

/**
 * Asynchronous method for processing a Unix glob.
 */
function processGlob(glob: string, cb: (expansion: string[]) => void): void {
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
  async.each(pathComps, function(path_comp: string, next_item: (e?: any) => void): void {
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
