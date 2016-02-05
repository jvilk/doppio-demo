import {ShellCommand, default as Shell} from '../shell';

export abstract class AbstractShellCommand implements ShellCommand {
  public abstract getCommand(): string;
  public getAutocompleteFilter(): (fname: string, isDir: boolean) => boolean {
    return (fname: string, isDir: boolean) => true;
  }
  public abstract run(terminal: Shell, args: string[], cb: () => void): void;
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
