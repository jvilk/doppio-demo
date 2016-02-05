import {AbstractShellCommand} from './meta';
import Shell from '../shell';

export class TimeCommand extends AbstractShellCommand {
  public getCommand() {
    return 'time';
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    var command = args[0],
      commandObj = terminal.getAvailableCommands()[command];

    if (commandObj === undefined) {
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
      "  mount_dropbox           -- Mount a Dropbox folder into the file system.\n\n"
    );
    cb();
  }
}
