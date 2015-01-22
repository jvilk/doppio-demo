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
  run(terminal: Terminal, args: string[]): void;
}

var welcomeMessage =
`Welcome to DoppioJVM! You may wish to try the following Java programs:
  cd /sys
  java classes/test/FileRead
  java classes/demo/Fib <num>
  java classes/demo/Chatterbot
  java classes/demo/RegexTestHarness
  java classes/demo/GzipDemo c Hello.txt hello.gz (compress)
  java classes/demo/GzipDemo d hello.gz hello.tmp (decompress)
  java classes/demo/DiffPrint Hello.txt hello.tmp

We support the stock Sun Java Compiler:
  javac classes/test/FileRead.java
  javac classes/demo/Fib.java

We can run Rhino, the Java-based JS engine:
  rhino

Text files can be edited by typing \`edit [filename]\`.

You can also upload your own files using the uploader above the top-right
corner of the console.

Enter 'help' for full a list of commands. Ctrl+D is EOF. Ctrl+C is SIGINT.

DoppioJVM has been tested with the latest versions of the following desktop browsers:
  Chrome, Safari, Firefox, Opera, Internet Explorer 10, and Internet Explorer 11.`;

/**
 * Abstracts away the messiness of JQConsole.
 */
class Terminal {
  private _console: JQConsole;
  private _consoleElement: JQuery;
  private _commands: { [command: string]: TerminalCommand } = {};

  constructor(console: JQConsole, consoleElement: JQuery, commands: TerminalCommand[]) {
    this._console = console;
    this._consoleElement = consoleElement;
    commands.forEach((c: TerminalCommand) => {
      this._commands[c.getCommand()] = c;
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
      this.stderr("Command " + args[0] + " is not defined.");
      this.exitProgram();
    } else {
      command.run(this, args);
    }
  }
  public exitProgram(): void {
    this._console.reprompt();
    this._consoleElement.click();
  }

  private _expandArguments(args: string[], cb: (expandedArgs: string[]) => void) {

  }
}

var process: NodeJS.Process = BrowserFS.BFSRequire('process'),
  Buffer = BrowserFS.BFSRequire('buffer').Buffer,
  fs = BrowserFS.BFSRequire('fs'),
  editor: AceAjax.Editor,
  sys_path = '/sys';

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
  // set up the local file loaders
  $('#file').change(uploadFiles);
  var jqconsole = $('#console');
  controller = jqconsole.console({
    promptLabel: ps1(),
    commandHandle: (line: string): any => {
      var parts = line.trim().split(/\s+/);
      var cmd = parts[0];
      var args = parts.slice(1).filter((a) => a.length > 0).map((a) => a.trim());
      if (cmd === '') {
        return true;
      }
      var handler = commands[cmd];
      if (handler == null) {
        return "Unknown command '" + cmd + "'. Enter 'help' for a list of commands.";
      }
      // Check for globs (*) in the arguments, and expand them.
      var expanded_args: string[] = [];
      util.asyncForEach(args,
        // runs on each argument
        function (arg: string, next_item): void {
          var starIdx = arg.indexOf('*');
          if (starIdx === -1) {
            // Regular element.
            expanded_args.push(arg);
            return next_item();
          }
          // Glob element.
          process_glob(arg, function (comps: string[]): void {
            expanded_args = expanded_args.concat(comps);
            next_item();
          });
        },
        // runs at the end of processing
        function (): void {
          try {
            var response = handler(expanded_args);
            if (response !== null) {
              controller.message(response, 'success');
            }
          } catch (_error) {
            controller.message(_error.toString(), 'error');
          }
        }
        );
    },
    cancelHandle: function (): void {
      if (jvm_state) {
        jvm_state.abort();
      }
    },
    tabComplete: tabComplete,
    autofocus: false,
    animateScroll: true,
    promptHistory: true,
    welcomeMessage: welcomeMessage,
  });
  stdout = function(data: NodeBuffer): void {
    controller.message(data.toString(), '', true);
  }
  user_input = function(resume: (data: any)=>void): void {
    var oldPrompt = controller.promptLabel;
    controller.promptLabel = '';
    controller.reprompt();
    var oldHandle = controller.commandHandle;
    controller.commandHandle = function(line: string) {
      controller.commandHandle = oldHandle;
      controller.promptLabel = oldPrompt;
      if (line === '\0') {
        // EOF
        resume(line);
      } else {
        line += "\n";  // so BufferedReader knows it has a full line
        resume(line);
      }
    };
  }
  function close_editor() {
    $('#ide').fadeOut('fast', function() {
      // click to restore focus
      $('#console').fadeIn('fast').click();
    });
  }
  $('#save_btn').click(function(e: JQueryEventObject) {
    var fname = $('#filename').val();
    var contents = editor.getSession().getValue();
    if (contents[contents.length - 1] !== '\n') {
      contents += '\n';
    }
    fs.writeFile(fname, contents, function(err: Error){
      if (err) {
        controller.message("File could not be saved: " + err, 'error');
      } else {
        controller.message("File saved as '" + fname + "'.", 'success');
      }
    });
    close_editor();
    e.preventDefault();
  });
  $('#close_btn').click(function(e: JQueryEventObject) {
    close_editor();
    e.preventDefault();
  });

  // Set up stdout/stderr/stdin.
  process.stdout.on('data', stdout);
  process.stderr.on('data', stdout);
  process.stdin.on('_read', function() {
    // Something is looking for stdin input.
    user_input(function(data: any) {
      // stdin is typically a readable stream, but it's a duplex in BrowserFS.
      // hence the type hack.
      (<any> process.stdin).write(data);
    });
  });
  preload();
});

function pad_right(str: string, len: number): string {
  return str + Array(len - str.length + 1).join(' ');
}

// helper function for 'ls'
function read_dir(dir: string, pretty: boolean, columns: boolean, cb: any): void {
  fs.readdir(path.resolve(dir), function(err: Error, contents: string[]){
    if (err || contents.length == 0) {
      return cb('');
    }
    contents = contents.sort();
    if (!pretty) {
      return cb(contents.join('\n'));
    }
    var pretty_list: string[] = [];
    util.asyncForEach(contents,
      // runs on each element
      function(c: string, next_item) {
        fs.stat(dir + '/' + c, function(err: Error, stat: fs.Stats) {
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
      function() {
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

var commands = {
  view_dump: function(args: string[]): string {
    if (args.length < 1) {
      return "Usage: view_dump <core-file.json>\nUse java -Xdump-state path/to/failing/class to generate one.";
    }
    controller.message('Loading dump file ' + args[0] + '...', 'success', true);
    fs.readFile(args[0], 'utf8', function(err: Error, dump: string) {
      if (err) {
        controller.message(" failed.\nError reading core dump: " + err.toString() + "\n", 'success', true);
        return controller.reprompt();
      }
      // Open the core viewer in a new window and save a reference to it.
      var viewer = window.open('core_viewer.html?source=browser');
      // Create a function to send the core dump to the new window.
      function send_dump(): void {
        try {
          viewer.postMessage(dump, location['origin']);
          controller.message(' success.\n', 'success', true);
        } catch (e) {
          controller.message(" failed.\nUnable to send dump information to new window. Check your popup blocker settings.\n", 'success', true);
        }
        controller.reprompt();
      }
      // RACE CONDITION: The window could load and trigger `onload` before we
      // configure a callback.
      // Start a timer to send the message after 5 seconds - the window should
      // have loaded by then.
      var delay = 5000;
      var timer = setTimeout(send_dump, delay);
      // If the window loads before 5 seconds, send the message straight away
      // and cancel the timer.
      viewer.onload = function() {
        clearTimeout(timer);
        send_dump();
      }
    });
    return null;
  },
  ecj: function(args: string[]): string {
    args.unshift('org/eclipse/jdt/internal/compiler/batch/Main');
    args.unshift('-Djdt.compiler.useSingleThread=true');
    java_cli.java(args, constructJavaOptions({
      launcherName: 'ecj'
    }), function(status: boolean): void {
      jvm_state = undefined;
      controller.reprompt();
    }, (jvm: TJVM) => {
      jvm_state = jvm;
    });
    return null;
  },
  javac: function(args: string[]): string {
    args.unshift('classes/util/Javac');
    java_cli.java(args, constructJavaOptions({
      classpath: [sys_path],
      launcherName: 'javac'
    }), function(status: boolean): void {
      jvm_state = undefined;
      controller.reprompt();
    }, (jvm: TJVM) => {
      jvm_state = jvm;
    });
    return null;
  },
  javap: function(args: string[]): string {
    args.unshift('classes/util/Javap');
    java_cli.java(args, constructJavaOptions({
      classpath: [sys_path],
      launcherName: 'javap'
    }), function(status: boolean): void {
      jvm_state = undefined;
      controller.reprompt();
    }, (jvm: TJVM) => {
      jvm_state = jvm;
    });
    return null;
  },
  java: function(args: string[]): string {
    java_cli.java(args, constructJavaOptions({
      classpath: ['.'],
      launcherName: 'java'
    }), function(result: boolean): void {
      jvm_state = undefined;
      controller.reprompt();
    }, (jvm: TJVM) => {
      jvm_state = jvm;
    });
    return null;
  },
  test: function(args: string[]): string {
    if (args[0] == null) {
      return "Usage: test all|[class(es) to test]";
    }
    // Change dir to $sys_path, because that's where tests expect to be run from.
    var curr_dir = process.cwd();
    function done_cb(): void {
      process.chdir(curr_dir);
      controller.reprompt();
    }
    process.chdir(sys_path);
    testing.runTests(constructJavaOptions({
      doppioDir: sys_path,
      testClasses: args[0] === 'all' ? null : args,
      hideDiffs: args[0] === 'all' ? true : false,
      quiet: false,
      keepGoing: true
    }), done_cb);
    return null;
  },
  rhino: function(args: string[]): string {
    args.unshift('com/sun/tools/script/shell/Main');
    java_cli.java(args, constructJavaOptions(), function(result: boolean): void {
      controller.reprompt();
    });
    return null;
  },
  ls: function(args: string[]): string {
    if (args.length === 0) {
      read_dir('.', true, true, (listing) => controller.message(listing, 'success'));
    } else if (args.length === 1) {
      read_dir(args[0], true, true, (listing) => controller.message(listing, 'success'));
    } else {
      util.asyncForEach(args,
        function(dir: string, next_item: ()=>void) {
          read_dir(dir, true, true, function(listing: string){
            controller.message(dir + ':\n' + listing + '\n\n', 'success', true);
            next_item();
          });
        }, controller.reprompt);
    }
    return null;
  },
  edit: function(args: string[]) {
    function start_editor(data: string): void {
      $('#console').fadeOut('fast', function(): void {
        $('#filename').val(args[0]);
        $('#ide').fadeIn('fast');
        // Initialize the editor. Technically we only need to do this once,
        // but more is fine too.
        editor = ace.edit('source');
        editor.setTheme('ace/theme/twilight');
        if (args[0] == null || args[0].split('.')[1] === 'java') {
          var JavaMode = ace.require("ace/mode/java").Mode;
          editor.getSession().setMode(new JavaMode);
        } else {
          var TextMode = ace.require("ace/mode/text").Mode;
          editor.getSession().setMode(new TextMode);
        }
        editor.getSession().setValue(data);
      });
    }
    if (args[0] == null) {
      start_editor(defaultFile('Test.java'));
      return true;
    }
    fs.readFile(args[0], 'utf8', function(err: Error, data: string): void {
      if (err) {
        start_editor(defaultFile(args[0]));
      } else {
        start_editor(data);
      }
      controller.reprompt();
    });
  },
  cat: function(args: string[]): string {
    var fname = args[0];
    if (fname == null) {
      return "Usage: cat <file>";
    }
    fs.readFile(fname, 'utf8', function(err: Error, data: string): void {
      if (err) {
        controller.message("Could not open file '" + fname + "': " + err, 'error');
      } else {
        controller.message(data, 'success');
      }
    });
    return null;
  },
  mv: function(args: string[]): string {
    if (args.length < 2) {
      return "Usage: mv <from-file> <to-file>";
    }
    fs.rename(args[0], args[1], function(err?: Error) {
      if (err) {
        controller.message("Could not rename "+args[0]+" to "+args[1]+": "+err, 'error', true);
      }
      controller.reprompt();
    });
    return null;
  },
  mkdir: function(args: string[]): string {
    if (args.length < 1) {
      return "Usage: mkdir <dirname>";
    }
    fs.mkdir(args[0], function(err?: Error) {
      if (err) {
        controller.message("Could not make directory " + args[0] + ".\n", 'error', true);
      }
      controller.reprompt();
    });
    return null;
  },
  cd: function(args: string[]): string {
    if (args.length > 1) {
      return "Usage: cd <directory>";
    }
    var dir: string;
    if (args.length == 0 || args[0] == '~') {
      // Change to the default (starting) directory.
      dir = '/tmp';
    } else {
      dir = path.resolve(args[0]);
    }
    // Verify path exists before going there.
    // chdir does not verify that the directory exists.
    fs.exists(dir, function(doesExist: boolean) {
      if (doesExist) {
        process.chdir(dir);
        controller.promptLabel = ps1();
      } else {
        controller.message("Directory " + dir + " does not exist.\n", 'error', true);
      }
      controller.reprompt();
    })
    return null;
  },
  rm: function(args: string[]): string {
    if (args[0] == null) {
      return "Usage: rm <file>";
    }
    var completed = 0;
    function remove_file(file: string, total: number): void {
      fs.unlink(file, function(err?: Error){
        if (err) {
          controller.message("Could not remove file: " + file + "\n", 'error', true);
        }
        if (++completed == total) {
          controller.reprompt();
        }
      });
    }
    if (args[0] === '*') {
      fs.readdir('.', function(err: Error, fnames: string[]){
        if (err) {
          controller.message("Could not read '.': " + err, 'error');
          return;
        }
        for (var i = 0; i < fnames.length; i++) {
          remove_file(fnames[i], fnames.length);
        }
      });
    } else {
      remove_file(args[0], 1);
    }
    return null;
  },
  mount_dropbox: function(args: string[]): string {
    var api_key: string = "j07r6fxu4dyd08r";
    if (args.length < 1 || args[0] !== 'Y') {
      return "This command may redirect you to Dropbox's site for authentication.\n" +
        "If you would like to proceed with mounting Dropbox into the in-browser " +
        "filesystem, please type \"mount_dropbox Y\".\n" +
        "Once you have successfully authenticated with Dropbox and the page reloads,\n" +
        "you will need to type \"mount_dropbox Y\" again to finish mounting.\n" +
        "If you would like to use your own API key, please type \"mount_dropbox Y your_api_key_here\".";
    }
    if (args.length == 2 && args[1].length === 15) {
      api_key = args[1];
    }
    var client = new Dropbox.Client({ key: api_key });
    client.authenticate(function(error: any, data?: any): void {
      var mfs;
      if (error == null) {
        mfs = (<any>fs).getRootFS();
        mfs.mount('/mnt/dropbox', new (<any>BrowserFS).FileSystem.Dropbox(client));
        controller.message("Successfully connected to your Dropbox account. You can now access files in the /Apps/DoppioJVM folder of your Dropbox account at /mnt/dropbox.", 'success');
        return;
      } else {
        controller.message("Unable to connect to Dropbox: " + error, 'error');
        return;
      }
    });
    return null;
  },
  emacs: function(): string {
    return "Try 'vim'.";
  },
  vim: function(): string {
    return "Try 'emacs'.";
  },
  time: function(args: string[]) {
    var start = (new Date).getTime();
    console.profile(args[0]);
    controller.onreprompt = function() {
      controller.onreprompt = null;
      console.profileEnd();
      var end = (new Date).getTime();
      controller.message("\nCommand took a total of " + (end - start) + "ms to run.\n", '', true);
    };
    return commands[args.shift()](args);
  },
  profile: function(args: string[]) {
    var count = 0;
    var runs = 5;
    var duration = 0;
    function time_once(): void {
      var start = (new Date).getTime();
      controller.onreprompt = function() {
        if (!(count < runs)) {
          controller.onreprompt = null;
          controller.message("\n" + args[0] + " took an average of " + (duration / runs) + "ms.\n", '', true);
          return;
        }
        var end = (new Date).getTime();
        if (count++ === 0) { // first one to warm the cache
          return time_once();
        }
        duration += end - start;
        return time_once();
      };
      return commands[args.shift()](args);
    }
    return time_once();
  },
  help: function(args: string[]): string {
    return "Ctrl-D is EOF.\n\n" +
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
};

function tabComplete(): void {
  var promptText = controller.promptText();
  var args = promptText.split(/\s+/);
  var last_arg = underscore.last(args);
  getCompletions(args, function(completions: string[]) {
    var prefix = longestCommmonPrefix(completions);
    if (prefix == '' || prefix == last_arg) {
      // We've no more sure completions to give, so show all options.
      var common_len = last_arg.lastIndexOf('/') + 1;
      var options = columnize(completions.map((c) => c.slice(common_len)));
      controller.message(options, 'success');
      controller.promptText(promptText);
      return;
    }
    // Delete existing text so we can do case correction.
    promptText = promptText.substr(0, promptText.length -  last_arg.length);
    controller.promptText(promptText + prefix);
  });
}

function getCompletions(args: string[], cb: (c: string[])=>void): void {
  if (args.length == 1) {
    cb(filterSubstring(args[0], Object.keys(commands)));
  } else if (args[0] === 'time') {
    getCompletions(args.slice(1), cb);
  } else {
    fileNameCompletions(args[0], args, cb);
  }
}

function filterSubstring(prefix: string, lst: string[]): string[] {
  return lst.filter((x) => x.substr(0, prefix.length) == prefix);
}

function validExtension(cmd: string, fname: string): boolean {
  var dot = fname.lastIndexOf('.');
  var ext = dot === -1 ? '' : fname.slice(dot + 1);
  if (cmd === 'javac') {
    return ext === 'java';
  } else if (cmd === 'javap') {
    return ext === 'class';
  } else if (cmd === 'java') {
    return ext === 'class' || ext === 'jar';
  }else {
    return true;
  }
}

function fileNameCompletions(cmd: string, args: string[], cb: (c: string[])=>void): void {
  var chopExt = args.length === 2 && (cmd === 'javap' || cmd === 'java');
  var toComplete = underscore.last(args);
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
    util.asyncForEach(dirList,
      // runs on each element
      function(item: string, next_item: ()=>void) {
        fs.stat(path.resolve(dirPfx + item), function(err: Error, stats) {
          if (err != null) {
            // Do nothing.
          } else if (stats.isDirectory()) {
            completions.push(dirPfx + item + '/');
          } else if (validExtension(cmd, item)) {
            if (chopExt) {
              completions.push(dirPfx + item.split('.', 1)[0]);
            } else {
              completions.push(dirPfx + item);
            }
          }
          next_item();
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
    return "class " + filename.substr(0, filename.length - 5) + " {\n"
        + "  public static void main(String[] args) {\n"
        + "    // enter code here\n  }\n}";
  }
  return "";
}

/**
 * Calls `readdir` on each directory, and ignores any files in `dirs`.
 * Tests the result against the regular expression.
 * Passes back any directories that pass the test.
 */
function expand_dirs(dirs: string[], r: RegExp, cb: (expansion: string[]) => void): void {
  var expanded: string[] = [];
  util.asyncForEach(dirs, function(dir: string, next_item: () => void): void {
    fs.readdir(dir, function(err: any, contents?: string[]): void {
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
  }, function() {
    cb(expanded);
  });
}

/**
 * Asynchronous method for processing a Unix glob.
 */
function process_glob(glob: string, cb: (expansion: string[]) => void): void {
  var glob_normalized: string = path.normalize(glob),
      path_comps: string[] = glob_normalized.split('/'),
      // We bootstrap the algorithm with '/' or '.', depending on whether or not
      // the glob is a relative or absolute path.
      expanded: string[] = [glob.charAt(0) === '/' ? '/' : '.'];

  /**
   * Constructs a regular expression for a given glob pattern.
   */
  function construct_regexp(pattern: string): RegExp {
    return new RegExp("^" + pattern.replace(/\./g, "\\.").split('*').join('[^/]*') + "$");
  }

  // Process each component of the path separately.
  util.asyncForEach(path_comps, function(path_comp: string, next_item: () => void): void {
    var r: RegExp;
    if (path_comp === "") {
      // This condition occurs for:
      // * The first component in an absolute directory.
      // * The last component in a path that ends in '/' (normalize doesn't remove it).
      return next_item();
    }
    r = construct_regexp(path_comp);
    expand_dirs(expanded, r, function(_expanded: string[]): void {
      expanded = _expanded;
      next_item();
    });
  }, function() {
    cb(expanded);
  });
}
