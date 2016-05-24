import BrowserFS = require('browserfs');
import {filterSubstring, recursiveCopy, disableScroll, recursiveRm} from './util';
import Shell from './shell';
import {JARCommand, JavaClassCommand, JavaCommand} from './commands/java';
import EditCommand from './commands/edit';
import {LSCommand, CatCommand, CDCommand, CpCommand, MkdirCommand, MountDropboxCommand, MvCommand, RMCommand, RmdirCommand} from './commands/fs';
import {TimeCommand, HelpCommand, ProfileCommand, TipCommand} from './commands/util';
import _fs = require('fs');
import Stats = _fs.Stats;
import Doppio = require('doppiojvm');

const process: NodeJS.Process = BrowserFS.BFSRequire('process'),
  Buffer = BrowserFS.BFSRequire('buffer').Buffer,
  fs = BrowserFS.BFSRequire('fs'),
  path = BrowserFS.BFSRequire('path'),
  demoJars = "/programs/",
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
    fs.writeFile(process.cwd() + '/' + f.name, new Buffer((<any> e.target).result), (err) => {
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
    terminal.stderr("\nYour browser doesn't support file loading.\nTry using the editor to create files instead.\n");
    return terminal.prompt();
  }
  var fileCount = ev.target.files.length, filesUploaded = 0;
  if (fileCount > 0) {
    terminal.stdout(`\nUploading ${fileCount} files...\n`);
  }

  const files = ev.target.files;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
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
        terminal.prompt();
      }
    });
  }
}

function startDemo() {
  // Set up the master terminal object.
  const consoleJQuery = $('#console');
  process.chdir('/home');
  consoleJQuery.fadeIn('fast', () => {
    const consoleElement = consoleJQuery.get()[0];
    disableScroll(consoleElement);
    const shell = new Shell(consoleElement, [
        new JARCommand('ecj', demoJars + "ecj-4.5.jar", ['-Djdt.compiler.useSingleThread=true'], ['java']),
        new JARCommand('rhino', demoJars + "rhino1.7.6.jar", [],  ['js']),
        new JARCommand('kawa', demoJars + "kawa-2.0.jar", [], ['scm', 'ss', 'sch']),
        new JARCommand('clojure', demoJars + "clojure1.7.0.jar", [], ['clj', 'cljs', 'cljc', 'edn']),
        // Needs --bin irb to do REPL. Add if no args!
        // new JARCommand('jruby', demoJars + "jruby-complete-9.0.1.0.jar", [], ['rb']),
        // Doesn't work :| Fucking jline.
        // new JARCommand('jython', demoJars + "jython-standalone-2.7.0.jar", ["-Djline.terminal=jline.UnsupportedTerminal"], ['js']),
        new JavaClassCommand('scala', "", 'scala.tools.nsc.MainGenericRunner', [
          '-Xbootclasspath/a:' + [
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
          `-Dscala.home=${demoJars}scala-2.11.7`, '-Dscala.usejavacp=true',
          '-Denv.emacs='
        ], [], ['scala', 'sc']),
        new JARCommand('groovy', demoJars + "groovy-all-2.4.5-indy.jar", [], ['groovy', 'gvy', 'gy', 'gsh']),
        new JARCommand('abcl', demoJars + "abcl-1.3.3.jar", [], ['lisp', 'cl', 'lsp', 'l']),
        new JARCommand('nashorn', "/home/vendor/java_home/lib/ext/nashorn.jar", [], ['js']),
        new JARCommand('abandon', "/programs/abandon.jar", [], ['conf']),
        new JavaClassCommand('scimark2', "/programs/scimark2lib.jar", 'jnt.scimark2.commandline', [], [], []),
        new JavaClassCommand('javac', demoClasses, "classes.util.Javac", [], [], ['java']),
        new JavaClassCommand('javap', demoClasses, "classes.util.Javap", [], [], ['class']),
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
        new TipCommand(),
        new HelpCommand()
      ], 'Please wait while the DoppioJVM demo loads...', `/home/.shell_history`);

    fs.readFile("/home/motd", (e: NodeJS.ErrnoException, data: Buffer) => {
      let welcomeText = "";
      if (!e) {
        welcomeText = data.toString();
      }

      // set up the local file loaders
      $('#file').change((ev: FileReaderEvent) => {
        uploadFiles(shell, ev);
      });

      // Set up stdout/stderr/stdin.
      process.stdout.on('data',(data: Buffer) => shell.stdout(data.toString()));
      process.stderr.on('data',(data: Buffer) => shell.stderr(data.toString()));

      shell.loadingCompleted(welcomeText);
    });
  });
}

/**
 * Mounts + sets up the file system.
 */
function setupFileSystem(persistentFs: any, cb: () => void): void {
  const root = new BrowserFS.FileSystem.MountableFileSystem();
  BrowserFS.initialize(root);
  fs.mkdirSync('/mnt');
  root.mount('/home', persistentFs);
  root.mount('/tmp', new BrowserFS.FileSystem.InMemory());
  root.mount('/mnt/localStorage', new BrowserFS.FileSystem.LocalStorage());
  root.mount('/programs', new BrowserFS.FileSystem.XmlHttpRequest(require('json!../../build/programs/listings.json'), 'programs/'));
  cb();
}

function constructPersistantFs(cb: (fs: any) => void): void {
  if (BrowserFS.FileSystem.IndexedDB.isAvailable()) {
    const idbfs = new BrowserFS.FileSystem.IndexedDB((e, fs) => {
      if (e) {
        cb(new BrowserFS.FileSystem.InMemory());
      } else {
        cb(idbfs);
      }
    }, 'doppio-cache');
  } else if (BrowserFS.FileSystem.HTML5FS.isAvailable()) {
    const html5fs = new BrowserFS.FileSystem.HTML5FS(100*1024*1024);
    html5fs.allocate((e) => {
      if (e) {
        cb(new BrowserFS.FileSystem.InMemory());
      } else {
        cb(html5fs);
      }
    });
  } else {
    cb(new BrowserFS.FileSystem.InMemory());
  }
}

/**
 * Downloads + extracts java_home to browser-local storage.
 */
function setupJavaHome(persistentFs: any, cb: () => void): void {
  const progressBarText = $('.progress-bar span');
  const progressBar = $('.progress-bar');
  const fs = BrowserFS.BFSRequire('fs');
  progressBarText.text(`Checking browser cache...`);
  BrowserFS.initialize(persistentFs);
  fs.readFile('/vendor/java_home/jdk.json', (err, data) => {
    if (err) {
      download();
    } else {
      try {
        const json = JSON.parse(data.toString());
        const expectedURL = Doppio.VM.JVM.getCompiledJDKURL();
        if (json.url === expectedURL) {
          // checks out. bypass download.
          cb();
        } else {
          // replace.
          download();
        }
      } catch (e) {
        download();
      }
    }
  });

  function download() {
    const xhr = new XMLHttpRequest();
    const startTime = (new Date()).getTime();
    xhr.open('GET', 'doppio_home.zip');
    xhr.responseType = "arraybuffer";
    xhr.addEventListener('progress', (e) => {
      const time = (new Date()).getTime();
      const loaded = e.loaded;
      const total = e.total;
      // KB/s
      const rate = (loaded >> 10) / ((time - startTime) / 1000);
      const remaining = (total - loaded) >> 10;
      const remainingTime = Math.floor(remaining / rate);
      const remainingMinutes = Math.floor(remainingTime / 60);
      const remainingSeconds = remainingTime % 60;
      const percent = ((loaded / total) * 100)|0;
      progressBarText.text(`Downloading doppio_home.zip at ${rate.toFixed(2)} KB/s [${loaded >> 10} KB / ${total >> 10} KB] (${remainingMinutes}m${remainingSeconds}s remaining)`);
      progressBar.attr('aria-valuenow', percent);
      progressBar.css('width', `${percent}%`);
    });
    xhr.addEventListener('load', (e) => {
      extract(xhr.response);
    });
    xhr.addEventListener('error', (e) => {
      progressBar.removeClass('active').addClass('progress-bar-danger');
      progressBarText.text(`Error downloading doppio_home.zip: ${e.error}`);
    });
    xhr.addEventListener('abort', (e) => {
      progressBar.removeClass('active').addClass('progress-bar-danger');
      progressBarText.text(`Error downloading doppio_home.zip: Transfer aborted.`);
    });
    xhr.send();
  }

  function extract(data: ArrayBuffer): void {
    const mfs = new BrowserFS.FileSystem.MountableFileSystem();
    mfs.mount('/persist', persistentFs);
    mfs.mount('/doppio_home', new BrowserFS.FileSystem.ZipFS(new Buffer(data)));
    BrowserFS.initialize(mfs);
    recursiveCopy('/doppio_home', '/persist', (src, dest, size) => {
      progressBarText.text(`Extracting ${dest.slice(dest.indexOf('/', 1) + 1)}...`);
    }, (err?) => {
      if (err) {
        progressBar.removeClass('active').addClass('progress-bar-danger');
        progressBarText.text(`Error extracting doppio_home.zip: ${err}`);
      } else {
        cb();
      }
    });
  }
}

$(document).ready(() => {
  let persistentFs: any = null;
  constructPersistantFs((_fs) => {
    persistentFs = _fs;
    BrowserFS.initialize(_fs);
    const fs = BrowserFS.BFSRequire('fs');
    fs.readdir('/', (err, files) => {
      if (files && files.length > 0) {
        // Add clear demo button.
        $('#clear-demo-button').fadeIn('fast').on('click', () => {
          $('#clear-demo-button').prop('disabled', true);
          const resetStatus = $('#reset-status');
          recursiveRm('/', (p) => {
            resetStatus.text(`Deleting cached file ${p}...`);
          }, (err) => {
            if(err) console.error(`Error removing: ${err}`);
            document.location.reload(true);
          });
        });
      }
    });
  });

  $('#demo_button').on('click', () => {
    $('#button-and-warning').fadeOut('fast', () => {
      $('#progress-bar-container').fadeIn('fast', () => {
        if (!persistentFs) {
          const progressBarText = $('.progress-bar span');
          progressBarText.text(`Waiting for you to grant or deny us access to browser storage....`);
          const interval = setInterval(() => {
            if (persistentFs) {
              clearInterval(interval);
              step2();
            }
          }, 100);
        } else {
          step2();
        }

        function step2() {
          setupJavaHome(persistentFs, () => {
            setupFileSystem(persistentFs, () => {
              $('#progress-bar-container').fadeOut('fast', () => {
                startDemo();
              });
            });
          });
        }
      });
    });
  });
});

