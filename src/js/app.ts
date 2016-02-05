import BrowserFS = require('browserfs');
import {filterSubstring, recursiveCopy} from './util';
import Shell from './shell';
import {JARCommand, JavaClassCommand, JavaCommand} from './commands/java';
import EditCommand from './commands/edit';
import {LSCommand, CatCommand, CDCommand, CpCommand, MkdirCommand, MountDropboxCommand, MvCommand, RMCommand, RmdirCommand} from './commands/fs';
import {TimeCommand, HelpCommand, ProfileCommand} from './commands/util';

const process: NodeJS.Process = BrowserFS.BFSRequire('process'),
  Buffer = BrowserFS.BFSRequire('buffer').Buffer,
  fs = BrowserFS.BFSRequire('fs'),
  path = BrowserFS.BFSRequire('path'),
  demoJars = "/home/programs/",
  demoClasses = "/home/classes/";

// Set the origin location, if it's not already.
if (location['origin'] == null) {
  location['origin'] = location.protocol + "//" + location.host;
}

// Add the .files attr for FileReader event targets.
interface FileReaderEvent extends ErrorEvent {
  target: FileReaderEventTarget;
}
interface FileReaderEventTarget extends EventTarget {
  files: File[];
  error: any;
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
function uploadFiles(terminal: Shell, ev: FileReaderEvent) {
  if (typeof FileReader === "undefined" || FileReader === null) {
    terminal.stderr("Your browser doesn't support file loading.\nTry using the editor to create files instead.\n");
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

$(document).ready(() => {
  // Set up file system.
  const xhrfs = new BrowserFS.FileSystem.XmlHttpRequest(require('json!../../build/demo_files/listings.json'), 'demo_files/'),
    mfs = new BrowserFS.FileSystem.MountableFileSystem(),
    fs = BrowserFS.BFSRequire('fs');

  mfs.mount('/sys', xhrfs);
  BrowserFS.initialize(mfs);
  fs.mkdirSync('/mnt');
  mfs.mount('/mnt/localStorage', new BrowserFS.FileSystem.LocalStorage());

  fs.mkdirSync('/home');
  process.chdir('/home');

  recursiveCopy('/sys/classes', '/home', (err?) => {
    recursiveCopy('/sys/programs', '/home', (err?) => {
      // Set up the master terminal object.
      fs.readFile("/sys/motd", (e: NodeJS.ErrnoException, data: Buffer) => {
        let welcomeText = "";
        if (!e) {
          welcomeText = data.toString();
        }
        const shell = new Shell($('#console'), [
          new JARCommand('ecj', demoJars + "ecj-4.5.jar", ['-Djdt.compiler.useSingleThread=true'], ['java']),
          new JARCommand('rhino', demoJars + "rhino1.7.6.jar", [], ['js']),
          new JARCommand('kawa', demoJars + "kawa-2.0.jar", [], ['js']),
          new JARCommand('clojure', demoJars + "clojure1.7.0.jar", [], ['js']),
          // Needs --bin irb to do REPL. Add if no args!
          new JARCommand('jruby', demoJars + "jruby-complete-9.0.1.0.jar", [], ['js']),
          // Doesn't work :| Fucking jline.
          new JARCommand('jython', demoJars + "jython-standalone-2.7.0.jar", ["-Djline.terminal=jline.UnsupportedTerminal"], ['js']),
          new JavaClassCommand('scala', "", 'scala.tools.nsc.MainGenericRunner', [
            "-Xbootclasspath/a", [
              'akka-actor_2.11-2.3.10.jar',
              'config-1.2.1.jar',
              'jline-2.12.1.jar',
              'scala-actors-2.11.0.jar',
              'scala-actors-migration_2.11-1.1.0.jar',
              'scala-compiler.jar',
              'scala-continuations-library_2.11-1.0.2.jar',
              'scala-continuations-plugin_2.11.7-1.0.2.jar',
              'scala-library.jar',
              'scala-parser-combinators_2.11-1.0.4.jar',
              'scala-reflect.jar',
              'scala-swing_2.11-1.0.2.jar',
              'scala-xml_2.11-1.0.4.jar',
              'scalap-2.11.7.jar'
            ].map((item) => `${demoJars}scala-2.11.7/lib/${item}`).join(':'),
            "-classpath", "", `-Dscala.home=${demoJars}scala-2.11.7`, '-Dscala.usejavacp=true',
            '-Denv.emacs='
          ], ['js']),
          new JARCommand('groovy', demoJars + "groovy-all-2.4.5-indy.jar", [], ['js']),
          new JARCommand('abcl', demoJars + "abcl-contrib-1.3.3.jar", [], ['js']),
          new JARCommand('nashorn', "/sys/java_home/lib/ext/nashorn.jar", [], ['js']),
          new JavaClassCommand('javac', demoClasses, "classes.util.Javac", [], ['java']),
          new JavaClassCommand('javap', demoClasses, "classes.util.Javap", [], ['class']),
          new JavaCommand(),
          new LSCommand(),
          new EditCommand('source', $('#save_btn'), $('#close_btn'), $('#ide'), $('#console'), $('#filename')),
          new CatCommand(),
          new MvCommand(),
          new CpCommand(),
          new MkdirCommand(),
          new CDCommand(),
          new RMCommand(),
          new RmdirCommand(),
          new MountDropboxCommand(),
          new TimeCommand(),
          new ProfileCommand(),
          new HelpCommand()
        ], welcomeText);

        // set up the local file loaders
        $('#file').change((ev: FileReaderEvent) => {
          uploadFiles(shell, ev);
        });

          // Set up stdout/stderr/stdin.
        process.stdout.on('data',(data: Buffer) => shell.stdout(data.toString()));
        process.stderr.on('data',(data: Buffer) => shell.stderr(data.toString()));
        process.stdin.on('_read',() => {
          shell.stdin((text: string) => {
            // BrowserFS's stdin lets you write to it for emulation purposes.
            (<NodeJS.ReadWriteStream> process.stdin).write(new Buffer(text));
          });
        });

        // Open + focus the terminal.
        shell.terminal.open();
        shell.terminal.focus();
      });
    });
  });
});

