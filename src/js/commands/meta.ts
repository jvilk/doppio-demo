import {ShellCommand, default as Shell} from '../shell';

export abstract class AbstractShellCommand implements ShellCommand {
  public abstract getCommand(): string;
  public getAutocompleteFilter(): (fname: string, isDir: boolean) => boolean {
    return (fname: string, isDir: boolean) => true;
  }
  public translateFileToArg(fname: string): string {
    return fname;
  }
  public abstract run(terminal: Shell, args: string[], cb: () => void): void;
  /**
   * Called when the user hits CTRL+C.
   */
  public kill(): void {
    // NOP.
  }
}

export class SimpleCommand extends AbstractShellCommand {
  private _command: string;
  private _runCommand: (terminal: Shell, args: string[], cb: () => void) => void;
  constructor(command: string, runCommand: (terminal: Shell, args: string[], cb: () => void) => void) {
    super();
    this._command = command;
    this._runCommand = runCommand;
  }
  public getCommand() {
    return this._command;
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    this._runCommand(terminal, args, cb);
  }
}
