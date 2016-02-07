import async = require('async');
import {processGlob, longestCommmonPrefix, fileNameCompletions, filterSubstring, columnize} from './util';
import _ = require('underscore');
import TBrowserFS = require('browserfs');
declare const BrowserFS: typeof TBrowserFS;
const process = BrowserFS.BFSRequire('process');
const Buffer = BrowserFS.BFSRequire('buffer').Buffer;

export interface ShellCommand {
  getCommand(): string;
  getAutocompleteFilter(): (fname: string, isDir: boolean) => boolean;
  run(terminal: Shell, args: string[], cb: () => void): void;
  kill(): void;
}

let _globalUniqueId: number = 1;

function fixTextForTerminal(text: string) {
  return text.replace(/\t/g, '    ');
}

/**
 * Runs a shell on a Termlib terminal.
 */
export default class Shell {
  private _terminal: Termlib.Terminal = null;
  private _commands: { [command: string]: ShellCommand } = {};
  private _shellElement: JQuery;
  private _activeCommand: ShellCommand = null;

  constructor(shellElement: JQuery, commands: ShellCommand[], loadingText: string) {
    this._shellElement = shellElement;
    commands.forEach((c: ShellCommand) => {
      this._commands[c.getCommand()] = c;
    });

    let termDiv = shellElement.attr('id');
    if (!termDiv) {
      termDiv = `shell-terminal${_globalUniqueId++}`;
      shellElement.attr('id', termDiv);
    }

    const rows = 500;
    const term = this._terminal = new Terminal({
      blinkDelay: 500,
      x: 0,
      y: 0,
      rows: rows,
      frameWidth: 10,
      termDiv: termDiv,
      ps: '',
      handler: (): void => {
        if (!term.charMode) {
          term.newLine();
          let parts = term.lineBuffer.trim().split(/\s+/);
          this.runCommand(parts);
        } else {
          let inputChar = term.inputChar;
          let printChar: string = null;
          switch (inputChar) {
            case termKey['CR']:
              printChar = '\n';
              break;
            case termKey['BACKSPACE']:
              this.backspace(1);
              break;
            case termKey['ETX']:
              this._activeCommand.kill();
              break;
            case termKey['EOT']:
              // EOT => EOF
              inputChar = 0;
              printChar = "\0";
              break;
            default:
              printChar = String.fromCharCode(inputChar);
              break;
          }

          if (printChar) {
            this.stdout(printChar);
          }
          (<NodeJS.WritableStream> <any> process.stdin).write(new Buffer([inputChar]));
        }
      },
      ctrlHandler: (): void => {
        const inputChar = term.inputChar;
        console.log("CTRL: " + inputChar);
        if (!this._activeCommand) {
          // Unset so it does not repeat.
          term.inputChar = 0;
          switch(inputChar) {
            case termKey['TAB']:
              // HACK: Get current line's text.
              let lineText = shellElement.find('.termReverse').parent()[0].childNodes[0].textContent.slice(term.ps.length + 1);
              this.tabComplete(lineText, lineText.trim().split(/\s+/));
              break;
            default:
              console.log("Unhandled: " + inputChar);
              break;
          }
        } else {

        }

        // TODO: Handle ctrl+ codes.
      },
      // TODO: Change when in program.
      printTab: false,
      greeting: ""
    });
    term.open();
    term.cursorSet(rows - 1, 0);
    this.stdout(`${loadingText}\n`);
    const scrollDest = shellElement.prop('scrollHeight') - shellElement.innerHeight();
    shellElement.scrollTop(scrollDest);
    term.cursorOff();

    /*consoleElement.console({
      promptLabel: this.ps1(),
      commandHandle: (line: string): any => {
        var parts = line.trim().split(/\s+/);
        this.runCommand(parts);
        return null;
      },
      cancelHandle: (): void => {
        // XXX: Need a 'currentcommand' that I can cancel.
      },
      tabComplete: () => {
        var promptText = this._console.promptText(),
          args = promptText.split(/\s+/),
          cmd = this._commands[args[0]];
        this.tabComplete(args);
      },
      autofocus: false,
      animateScroll: true,
      promptHistory: true,
      welcomeMessage: welcomeMessage,
    });*/
  }

  /**
   * Get the width of the terminal in characters.
   */
  public cols(): number {
    return this._terminal.maxCols;
  }

  /**
   * Called once the loading phase has completed.
   */
  public loadingCompleted(greeting: string): void {
    const term = this._terminal;
    this.stdout(greeting);
    this.updatePS();
    this.prompt();
  }

  public stdout(text: string): void {
    const term = this._terminal;
    term.write(term.escapeMarkup(fixTextForTerminal(text)), false);
    // HACK: Poke cursor to redraw it.
    term.cursorRight();
  }
  public stderr(text: string): void {
    const term = this._terminal;
    // Print red, then switch back to the default color.
    term.write(`%c(red)${term.escapeMarkup(fixTextForTerminal(text))}%c0`, false);
    // HACK: Poke cursor to redraw it.
    term.cursorRight();
  }
  public runCommand(args: string[]) {
    this._terminal.cursorOn();
    this._terminal.charMode = true;
    this._terminal.lock = false;
    if (args[0] === '') {
      return this.exitProgram();
    }
    if (this._activeCommand) {
      this.stderr(`ERROR: Already running a command!`);
    }

    const command = this._commands[args[0]];
    if (!command) {
      this.stderr(`Unknown command ${args[0]}. Type "help" for a list of commands.\n`);
      this.exitProgram();
    } else {
      this._expandArguments(args.slice(1), (expArgs, err) => {
        if (err) {
          this.stderr(`${command.getCommand()}: ${err}\n`);
          this.exitProgram();
        } else {
          this._activeCommand = command;
          command.run(this, expArgs, () => {
            this.exitProgram();
          });
        }
      });
    }
  }
  public exitProgram(): void {
    const term = this._terminal;
    this._activeCommand = null;
    term.charMode = false;
    term.rawMode = false;
    this.prompt();
  }
  public focus(): void {
    this._terminal.focus();
  }
  private _ps(): string {
    return `${process.cwd()} $`;
  }
  /**
   * Updates the terminal's prompt to one valid for the current directory.
   */
  public updatePS(): void {
    this._terminal.ps = this._ps();
  }
  public getAvailableCommands(): { [commandName: string]: ShellCommand } {
    return _.clone(this._commands);
  }
  private _expandArguments(args: string[], cb: (expandedArgs: string[], err: any) => void) {
    var expandedArgs: string[] = [];
    async.each(args,(arg: string, cb: (e?: any) => void) => {
      if (arg.indexOf('*') == -1) {
        expandedArgs.push(arg);
        cb();
      } else {
        processGlob(arg, (expansionTerms: string[]) => {
          if (expansionTerms.length > 0) {
            expandedArgs = expandedArgs.concat(expansionTerms);
            cb();
          } else {
            cb(`${arg}: No such file or directory`);
          }
        });
      }
    },(e?: any) => {
      cb(expandedArgs, e);
    });
  }

  public getCompletions(args: string[], cb: (c: string[]) => void): void {
    if (args.length == 1) {
      cb(filterSubstring(args[0], Object.keys(this.getAvailableCommands())));
    } else if (args[0] === 'time') {
      this.getCompletions(args.slice(1), cb);
    } else {
      var cmd = this.getAvailableCommands()[args[0]],
          filter: (fname: string, isDir: boolean) => boolean = () => true;
      if (cmd != null) {
        filter = cmd.getAutocompleteFilter();
      }
      fileNameCompletions(args[0], args, filter, cb);
    }
  }

  public backspace(length: number): void {
    const term = this._terminal;
    for (let i = 0; i < length; i++) {
      term.backspace();
    }
  }

  public prompt(): void {
    this._terminal.cursorOff();
    this._terminal.prompt();
  }

  public tabComplete(lineText: string, args: string[]): void {
    const term = this._terminal;
    // The argument we are completing.
    const lastArg = _.last(args);
    this.getCompletions(args, (completions: string[]) => {
      if (completions.length == 1) {
        // To avoid issues with whitespace, delete the previously
        // typed line and standardize w/ single spaces between args.
        this.backspace(lineText.length);
        const completion = completions[0];
        args[args.length - 1] = completion;
        this.stdout(args.join(" ") + ((completion[completion.length - 1] !== '/') ? ' ' : ''));
      } else if (completions.length > 0) {
        let prefix = longestCommmonPrefix(completions);
        if (prefix === '' || prefix === lastArg) {
          // We've no more sure completions to give, so show all options.
          let commonLen = lastArg.lastIndexOf('/') + 1;
          let options = completions.map((c) => c.slice(commonLen));
          options.sort();
          this.stdout(`\n${columnize(options, term.maxCols)}`);
          this.prompt();
          this.stdout(lineText);
        } else {
          // Delete existing text so we can do case correction.
          this.backspace(lineText.length);
          args[args.length - 1] = prefix;
          this.stdout(args.join(" "));
        }
      }
    });
  }
}
