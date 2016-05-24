import {AbstractShellCommand} from './meta';
import Shell from '../shell';

export class TimeCommand extends AbstractShellCommand {
  public getCommand() {
    return 'time';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    var command = args[0],
      commandObj = terminal.getAvailableCommands()[command];

    if (args.length == 0) {
      terminal.stdout(`Usage: time [program] [args]`);
      cb();
    } else if (commandObj === undefined) {
      terminal.stderr(`Undefined command: ${command}\n`);
      cb();
    } else {
      var start = (new Date).getTime();
      console.profile(command);
      commandObj.run(terminal, args.slice(1), () => {
        console.profileEnd();
        var end = (new Date).getTime();
        terminal.stdout(`\nTime elapsed: ${end - start} ms.\n`);
        cb();
      });
    }
  }
}

export class ProfileCommand extends AbstractShellCommand {
  public getCommand() {
    return 'profile';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    var count = 0, runs = 5, duration = 0, command = args[0],
      commandObj = terminal.getAvailableCommands()[command];
    if (commandObj === undefined) {
      terminal.stdout(`Undefined command: ${command}\n`);
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

export class HelpCommand extends AbstractShellCommand {
  public getCommand() {
    return 'help';
  }

  public getAutocompleteFilter() {
    // help command takes no arguments
    return () => false;
  }

  public run(terminal: Shell, args: string[], cb: () => void): void {
    terminal.stdout(
`Use Ctrl-C for SIGINT, tab for autocomplete, and the upload button to upload
files into the current virtual filesystem directory.

\x1b[1mStandard commands:\x1b[0m
  cat <file>     ls <dir>       mv <src> <dst>    time <command>
  edit <file>    cd <dir>       cp <src> <dst>
  rm <file>      rmdir <dir>
                 mkdir <dir>

\x1b[1mREPLs and Compilers:\x1b[0m (WARNING: These trigger downloads!)
  nashorn (JavaScript)    scala (Scala)         groovy (Groovy)
  rhino (JavaScript)      abcl (Common LISP)    clojure (Clojure)
  kawa (Scheme)

\x1b[1mSpecial commands:\x1b[0m
  mount_dropbox           -- Mount a Dropbox folder into the file system.
  profile <command>       -- Profile a command with 5 runs.
  tip                     -- Get a random idea to try out in the demo.

\x1b[1mJava-related commands:\x1b[0m
  javac <source file>     -- Invoke the Java 8 compiler.
  ecj <source file>       -- Invoke the Eclipse Java compiler.
  java <class> [args...]  -- Run with command-line arguments.
  javap [args...] <class> -- Run the Java 8 disassembler.

\x1b[1mPrograms and Demos:\x1b[0m
  abandon   Double-entry accounting software written in Scala.
            Try 'abandon -c /home/files/abandon/examples/complete/accounts.conf'
  scimark2  An old-school Java benchmark for JVMs. Measures JVM speed for
            scientific and numerical computing. May freeze up the browser,
            as the program has a number of long-running loops.

  Small Java demos are located in /home/classes/demo, along with their source
  code.

`);
    cb();
  }
}

const tips: string[] = [
`Upload a JAR using the "Upload Files" button, and run it in DoppioJVM with
java -jar [file.jar]`,
`Mount a Dropbox folder into the in-browser filesystem with mount_dropbox, sync
Java programs to Dropbox, and watch them appear in the in-browser filesystem!`,
`Edit one of the built-in demos at /home/classes/demo, re-compile it with javac,
and re-run it with java!`,
`Ever use Java 8? Try experimenting with new Java 8 features! DoppioJVM
supports them.`,
`Try random JAR files in DoppioJVM and see what works. If it seems
interesting, file an issue at https://github.com/plasma-umass/doppio-demo and
we may include it in a demo update!`,
`Run the abandon accounting software on the example input:
abandon -c /home/files/abandon/examples/complete/accounts.conf
Modify the input, and try it again.`
];
function getRandomTip(): string {
  const min = 0, max = tips.length;
  return tips[Math.floor(Math.random() * (max - min))];
}

export class TipCommand extends AbstractShellCommand {
  public getCommand() {
    return 'tip';
  }

  public getAutocompleteFilter() {
    // tip command takes no arguments
    return () => false;
  }

  public run(terminal: Shell, args: string[], cb: () => void): void {
    terminal.stdout(getRandomTip() + "\n");
    cb();
  }
}
