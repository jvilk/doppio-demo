import async = require('async');
import {processGlob, longestCommmonPrefix, fileNameCompletions, filterSubstring, columnize} from './util';
import _ = require('underscore');
import TBrowserFS = require('browserfs');
import Terminal = require('xterm');
declare const BrowserFS: typeof TBrowserFS;
const process = BrowserFS.BFSRequire('process');
const Buffer = BrowserFS.BFSRequire('buffer').Buffer;
const fs = BrowserFS.BFSRequire('fs');
declare var globalTerm: Terminal;
(<any> global).globalTerm = null;

export interface ShellCommand {
  getCommand(): string;
  getAutocompleteFilter(): (fname: string, isDir: boolean) => boolean;
  run(terminal: Shell, args: string[], cb: () => void): void;
  kill(): void;
}

/**
 * Enum containing keycodes that we specially handle.
 */
const enum KeyCodes {
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40,
  BACKSPACE = 8,
  TAB = 9,
  DELETE = 46,
  END = 35,
  HOME = 36,
  ENTER = 13,
  ALT = 18,
  INSERT = 45,
  A = 65,
  C = 67,
  D = 68,
  E = 69,
  N = 78,
  P = 80,
  B = 66,
  F = 70,
  K = 75,
  v = 118,
  V = 86
}

class ControlCodes {
  static SAVE_CURSOR = "\x1b7";
  static RESTORE_CURSOR = "\x1b8";
  static UP_ARROW = "\x1b[A";
  static RIGHT_ARROW = "\x1b[C";
  static LEFT_ARROW = "\x1b[D";
  static SHOW_CURSOR = "\x1b[?25h";
  static CURSOR_POSITION(term: Terminal, col: number, row: number) {
    return `\x1b[${row+1 - term.ybase};${col+1}H`;
  }
}

/**
 * Runs a shell on an xterm.js terminal.
 */
export default class Shell {
  private _terminal: Terminal = null;
  private _commands: { [command: string]: ShellCommand } = {};
  private _activeCommand: ShellCommand = null;
  // Is the shell enabled, or is a program running?
  private _shellEnabled: boolean = false;
  private _psX: number = 0;
  private _psY: number = 0;
  private _endX: number = 0;
  private _endY: number = 0;
  private _history: string[] = [];
  private _historyOffset: number = 0;
  private _disableInput = true;
  private _savedCommand = "";
  private _shellHistoryFile: string;

  constructor(shellElement: HTMLElement, commands: ShellCommand[], loadingText: string, shellHistoryFile: string) {
    this._shellHistoryFile = shellHistoryFile;
    commands.forEach((c: ShellCommand) => {
      this._commands[c.getCommand()] = c;
    });

    const rows = 15;
    const term = this._terminal = globalTerm = new Terminal({
      cols: 100,
      rows: rows,
      cursorBlink: true
    });
    term.open(shellElement);
    term.cursorHidden = true;

    const isRaw: boolean = (<any> process.stdin).isRaw;
    term.on('key', (key, e) => {
      if (this._disableInput) {
        return;
      }
      const keyCode = e.keyCode;
      let keyProcessed = false;
      if (e.ctrlKey) {
        switch (keyCode) {
          case KeyCodes.A:
            // move cursor to start
            if (this._shellEnabled) {
              keyProcessed = true;
              this._moveToStart();
            }
            break;
          case KeyCodes.C:
            // Special: Kill any active programs. Otherwise, ignore.
            keyProcessed = true;
            this.killProgram();
            break;
          case KeyCodes.D:
            // forward delete
            if (this._shellEnabled) {
              keyProcessed = true;
              this._forwardDelete();
            }
            break;
          case KeyCodes.E:
            // move to end
            if (this._shellEnabled) {
              keyProcessed = true;
              this._moveToEnd();
            }
            break;
          case KeyCodes.N:
            // next history
            if (this._shellEnabled) {
              keyProcessed = true;
              this._nextHistory();
            }
            break;
          case KeyCodes.P:
            // prev history
            if (this._shellEnabled) {
              keyProcessed = true;
              this._prevHistory();
            }
            break;
          case KeyCodes.B:
            // back
            if (this._shellEnabled) {
              keyProcessed = true;
              this._cursorLeft();
            }
            break;
          case KeyCodes.F:
            // forward
            if (this._shellEnabled) {
              keyProcessed = true;
              this._cursorRight();
            }
            break;
          case KeyCodes.K:
            // delete until end
            if (this._shellEnabled) {
              keyProcessed = true;
              const toDelete = this._getEnteredText().length - this._getCursorOffset();
              for (let i = 0; i < toDelete; i++) {
                this._forwardDelete();
              }
            }
            break;
          default:
            keyProcessed = false;
            break;
        }
      } else if (e.altKey) {
        switch (keyCode) {
          case KeyCodes.F:
            // move to next word
            break;
          case KeyCodes.B:
            // move to prev word
            break;
          case KeyCodes.D:
            // delete next word
            break;
        }
      } else {
        switch (keyCode) {
          case KeyCodes.UP:
            // prev history
            if (this._shellEnabled) {
              keyProcessed = true;
              this._prevHistory();
            }
            break;
          case KeyCodes.DOWN:
            // next history
            if (this._shellEnabled) {
              keyProcessed = true;
              this._nextHistory();
            }
            break;
          case KeyCodes.LEFT:
            if (this._shellEnabled) {
              keyProcessed = true;
              this._cursorLeft();
            }
            break;
          case KeyCodes.RIGHT:
            if (this._shellEnabled) {
              keyProcessed = true;
              this._cursorRight();
            }
            break;
          case KeyCodes.BACKSPACE:
            // delete character
            this.stdin('\b');
            break;
          case KeyCodes.TAB:
            if (this._shellEnabled) {
              keyProcessed = true;
              this._disableInput = true;
              const cmd = this._getEnteredText();
              this._tabComplete(cmd, this._getArgs(cmd), () => {
                this._disableInput = false;
              });
            }
            break;
          case KeyCodes.DELETE:
            // forward delete
            if (this._shellEnabled) {
              keyProcessed = true;
              this._forwardDelete();
            }
            break;
          case KeyCodes.END:
            // move to end
            if (this._shellEnabled) {
              keyProcessed = true;
              this._moveToEnd();
            }
            break;
          case KeyCodes.HOME:
            // Move to start
            if (this._shellEnabled) {
              keyProcessed = true;
              this._moveToStart();
            }
            break;
          case KeyCodes.ENTER:
            // run command.
            if (this._shellEnabled) {
              keyProcessed = true;
              const cmd = this._getEnteredText();
              this.stdout(`${ControlCodes.CURSOR_POSITION(this._terminal, this._endX, this._endY)}\n`);
              this._runCommand(cmd, this._getArgs(cmd));
            }
            break;
        }

        if (!keyProcessed) {
          this.stdin(key);
        }
      }
    });

    this._terminal;
  }

  /**
   * Get the width of the terminal in characters.
   */
  public cols(): number {
    return this._terminal.cols;
  }

  private _cursorX(): number {
    return this._terminal.x;
  }

  private _cursorY(): number {
    return this._terminal.ybase + this._terminal.y;
  }

  /**
   * Called once the loading phase has completed.
   */
  public loadingCompleted(greeting: string): void {
    fs.readFile(this._shellHistoryFile, (err, data) => {
      if (!err) {
        this._history = data.toString().split('\n');
        this._historyOffset = this._history.length;
      }
      if (greeting[greeting.length - 1] !== '\n') {
        greeting += '\n';
      }
      this._disableInput = false;
      this.backspace(this.cols());
      this.stdout(greeting);
      this.prompt();
    });
  }

  private _cursorLeft(): void {
    if (this._cursorX() === 0 && this._cursorY() > 0) {
      // Move up one, to end of line.
      this.stdin(ControlCodes.CURSOR_POSITION(this._terminal, this._terminal.cols - 1, this._cursorY() - 1));
    } else {
      this.stdin(ControlCodes.LEFT_ARROW);
    }
  }

  private _cursorRight(): void {
    if (this._cursorX() === this._terminal.cols - 1 && this._endY > this._cursorY()) {
      this.stdin(ControlCodes.CURSOR_POSITION(this._terminal, 0, this._cursorY() + 1));
    } else {
      this.stdin(ControlCodes.RIGHT_ARROW);
    }
  }

  private _prevHistory(): void {
    if (this._history.length > 0 && this._historyOffset > 0) {
      if (this._historyOffset === this._history.length) {
        this._savedCommand = this._getEnteredText();
      }
      this._historyOffset--;
      this._redrawPrompt(this._history[this._historyOffset]);
    }
  }

  private _nextHistory(): void {
    if (this._history.length > 0 && this._historyOffset < this._history.length) {
      this._historyOffset++;
      if (this._historyOffset === this._history.length) {
        this._redrawPrompt(this._savedCommand);
      } else {
        this._redrawPrompt(this._history[this._historyOffset]);
      }
    }
  }

  private _moveToStart(): void {
    this.stdin(ControlCodes.CURSOR_POSITION(this._terminal, this._psX, this._psY));
  }

  private _moveToEnd(): void {
    this.stdin(ControlCodes.CURSOR_POSITION(this._terminal, this._endX, this._endY));
  }

  private _forwardDelete(): void {
    this._cursorRight();
    this.stdin('\b');
  }

  /**
   * Get the cursor offset into the currently typed command.
   */
  private _getCursorOffset(): number {
    const term = this._terminal;
    const promptX = this._psX;
    const promptY = this._psY;
    const termWidth = term.cols;
    const promptOffset = promptY * termWidth + promptX;
    const cursorX = this._cursorX();
    const cursorY = this._cursorY();
    const cursorOffset = cursorY * termWidth + cursorX;
    return cursorOffset - promptOffset;
  }

  /**
   * Get the currently entered text after the prompt.
   */
  private _getEnteredText(): string {
    let text = "";
    const term = this._terminal;
    const cols = term.cols;
    const lines = term.lines;
    const psY = this._psY;
    const endY = this._endY;
    const endX = this._endX;
    for (let y = psY; y <= endY; y++) {
      const row = lines[y];
      for (let x = (y === psY ? this._psX : 0); x < (y === endY ? endX : row.length); x++) {
        text += row[x][1];
      }
    }
    return text;
  }

  private _updateEndLocation(delta: number): void {
    const cols = this._terminal.cols;
    this._endX += delta;
    if (this._endX > cols) {
      const rows = Math.floor(this._endX / cols);
      this._endX -= (cols * rows);
      this._endY += rows;
    } else if (this._endX < 0) {
      const rows = Math.ceil(Math.abs(this._endX) / cols);
      this._endY -= rows;
      this._endX += (cols * rows);
    }
  }

  /**
   * User-provided input to the program, translated into terminal text.
   * @param isPrintable Is this a "printable" character?
   */
  private stdin(key: string): void {
    if (this._shellEnabled) {
      // xterm.js is always in insert mode. That's not what users expect.
      if (key === '\b') {
        // Handle specially.
        let command = this._getEnteredText(),
          cursorOffset = this._getCursorOffset();
        if (cursorOffset > 0) {
          this._cursorLeft();
          // Extra space overwrites end character.
          this.stdout(`${ControlCodes.SAVE_CURSOR}${command.slice(cursorOffset)} ${ControlCodes.RESTORE_CURSOR}`);
          this._updateEndLocation(-1);
        }
      } else {
        let suffix: string = null;
        // Impact on the end of the line?
        switch (key[0]) {
          // Ignore control codes.
          case '\x07': // bell
          case '\x1b': // \e: escaped control codes.
          case '\x0e': // shift out
          case '\x0f': // shift in
            break;
          default:
            suffix = `${ControlCodes.SAVE_CURSOR}${this._getEnteredText().slice(this._getCursorOffset())}${ControlCodes.RESTORE_CURSOR}`;
            this._updateEndLocation(1);
            break;
        }
        // Have terminal process text.
        this.stdout(key);
        if (this._terminal.x === this._terminal.cols) {
          // XXX: Hackfix for xterm bug -- off by one.
          this._terminal.x--;
          this._cursorRight();
        }
        const yBefore = this._cursorY();
        if (suffix) {
          this.stdout(suffix);
        }
        const yAfter = this._cursorY();
        if (yAfter !== yBefore) {
          // XXX: Hackfox for end of line.
          this.stdout(ControlCodes.UP_ARROW);
        }
        // Update the prompt.
        this._updatePrompt();
      }
    } else {
      const isRaw: boolean = (<any> process.stdin).isRaw;
      if (!isRaw) {
        // Echo the text.
        this.stdout(key);
      }
      // Pass to program.
      (<NodeJS.ReadWriteStream> process.stdin).write(key);
    }
  }

  public stdout(text: string): void {
    const term = this._terminal;
    term.write(text.replace(/\n/g, '\r\n'));
  }

  public stderr(text: string): void {
    const term = this._terminal;
    // Print red, then switch back to the default color.
    term.write(`\x1b[31m${text.replace(/\n/g, '\r\n')}\x1b[0m`);
  }

  private _getArgs(command: string): string[] {
    return this._getEnteredText().split(/\s+/g);
  }

  private _runCommand(raw: string, args: string[]) {
    this._shellEnabled = false;
    this._historyOffset = this._history.push(raw);
    fs.writeFile(this._shellHistoryFile, new Buffer(this._history.join("\n")), () => {});
    if (args[0] === '') {
      return this.exitProgram();
    }
    if (this._activeCommand) {
      this.stderr(`ERROR: Already running a command!\n`);
      return;
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
  public killProgram(): void {
    if (this._activeCommand) {
      this._activeCommand.kill();
      this.prompt();
    }
  }
  public exitProgram(): void {
    this._activeCommand = null;
    if (this._cursorX() !== 0) {
      this.stdout("\n");
    }
    this.prompt();
  }
  public focus(): void {
    this._terminal.focus();
  }

  private _ps(): string {
    return `${process.cwd()} $`;
  }

  public getAvailableCommands(): { [commandName: string]: ShellCommand } {
    return _.clone(this._commands);
  }

  /**
   * After xterm.js updates the cursor, this function ensures that
   * it is in a shell-legal position.
   */
  private _boundCursor(): void {
    const term = this._terminal;
    const cursorX = this._cursorX();
    const cursorY = this._cursorY();
    const psX = this._psX;
    const psY = this._psY;
    const endX = this._endX;
    const endY = this._endY;
    const cols = this._terminal.cols;
    const cursorOffset = cursorY*cols + cursorX;
    const psOffset = psY*cols + psX;
    const endOffset = endY*cols + endX;
    if (cursorOffset < psOffset) {
      this.stdout(ControlCodes.CURSOR_POSITION(this._terminal, psX, psY));
    } else if (cursorOffset > endOffset) {
      this.stdout(ControlCodes.CURSOR_POSITION(this._terminal, endX, endY));
    }
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
    let backspaceStr = '';
    for (let i = 0; i < length; i++) {
      // \b doesn't clear the current character.
      // Back up one character, replace with one space, back up one more time.
      backspaceStr += "\b \b";
    }
    this._terminal.write(backspaceStr);
  }

  /**
   * Enables the shell (if disabled), and prompts for user input.
   */
  public prompt(): void {
    (<any> process.stdin).setRawMode(false);
    this._shellEnabled = true;
    this._terminal.write(`${this._ps()} `);
    this._psX = this._endX = this._cursorX();
    this._psY = this._endY = this._cursorY();
    this.stdout(ControlCodes.SHOW_CURSOR);
  }

  /**
   * After the user has entered text, update the prompt text
   * to the *right* of the cursor.
   */
  private _updatePrompt(): void {
    // Save cursor position.
    // Insert text.
    // Restore cursor position.
    this._boundCursor();
  }

  /**
   * Given an updated _commandBuffer, redraw the existing prompt
   * with the cursor at the end of the prompt.
   */
  private _redrawPrompt(command: string): void {
    this._shellEnabled = true;
    const oldCommand = this._getEnteredText();
    this.stdout(ControlCodes.CURSOR_POSITION(this._terminal, this._endX, this._endY));
    for (let i = 0; i < oldCommand.length; i++) {
      this.stdin('\b');
    }
    this._terminal.write(command);
    this._updateEndLocation(command.length);
  }

  private _tabComplete(raw: string, args: string[], cb: () => void): void {
    // The argument we are completing.
    const term = this._terminal;
    const lastArg = _.last(args);
    this.getCompletions(args, (completions: string[]) => {
      if (completions.length == 1) {
        const completion = completions[0];
        args[args.length - 1] = completion;
        const command = args.join(" ") + ((completion[completion.length - 1] !== '/') ? ' ' : '');
        this._redrawPrompt(command);
      } else if (completions.length > 0) {
        let prefix = longestCommmonPrefix(completions);
        if (prefix === '' || prefix === lastArg) {
          // We've no more sure completions to give, so show all options.
          let commonLen = lastArg.lastIndexOf('/') + 1;
          let options = completions.map((c) => c.slice(commonLen));
          options.sort();
          this.stdout(`\n${columnize(options, term.cols)}`);
          // Create a new prompt with same command.
          this._redrawPrompt(raw);
        } else {
          args[args.length - 1] = prefix;
          this._redrawPrompt(args.join(" "));;
        }
      }
      cb();
    });
  }
}
