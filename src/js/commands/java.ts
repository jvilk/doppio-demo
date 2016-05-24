import {AbstractShellCommand} from './meta';
import Shell from '../shell';
import BrowserFS = require('browserfs');
import Doppio = require('doppiojvm');
import _ = require('underscore');
import JVMCLIOptions = Doppio.VM.Interfaces.JVMCLIOptions;
const path = BrowserFS.BFSRequire('path');

/**
 * Construct a JavaOptions object with the default demo fields filled in.
 * Optionally merge it with the custom arguments specified.
 */
function constructJavaOptions(customArgs: { [prop: string]: any } = {}): JVMCLIOptions {
  // Strip default classpath. The CLI module will add it back in, and it causes errors
  // if the -jar argument is specified.
  return _.extend(customArgs, Doppio.VM.JVM.getDefaultOptions('/home'), { classpath: [] });
}


export class JavaCommand extends AbstractShellCommand {
  private _jvm: Doppio.VM.JVM = null;
  private _killed: boolean = false;

  public getCommand(): string {
    return "java";
  }
  public getAutocompleteFilter() {
    // complete all directories, and some files
    return (fname: string, isDir: boolean) => {
      if (isDir) return true;
      var dot = fname.lastIndexOf('.');
      var ext = dot === -1 ? '' : fname.slice(dot+1);
      return ext === 'class' || ext === 'jar';
    }
  }
  public translateFileToArg(fname: string): string {
    const ext = path.extname(fname);
    if (ext == '.class') {
      return fname.slice(0, fname.lastIndexOf('.')).replace(/\//g, '.');
    }
    return fname;
  }
  public run(shell: Shell, args: string[], cb: () => void): void {
    Doppio.VM.CLI(args, constructJavaOptions({
      launcherName: this.getCommand()
    }), () => {
      // Reset state.
      this._jvm = null;
      this._killed = false;
      cb();
    }, (jvm) => {
      this._jvm = jvm;
      if (this._killed) {
        this._jvm.halt(0);
      }
    });
  }
  public kill() {
    if (!this._killed) {
      this._killed = true;
      if (this._jvm) {
        this._jvm.halt(0);
      }
    }
  }
}

export class JARCommand extends JavaCommand {
  private _cmd: string;
  private _jarPath: string;
  private _extraArgs: string[];
  private _validExts: string[];
  constructor(cmd: string, jarPath: string, extraArgs: string[] = [], validExts: string[] = []) {
    super();
    this._cmd = cmd;
    this._jarPath = jarPath;
    this._extraArgs = extraArgs;
    this._validExts = validExts;
  }
  public getCommand() {
    return this._cmd;
  }
  public getAutocompleteFilter() {
    return (fname: string, isDir: boolean) => {
      if (isDir) return true;
      var dot = fname.lastIndexOf('.');
      var ext = dot === -1 ? '' : fname.slice(dot+1);
      for (var i = 0; i < this._validExts.length; i++) {
        if (ext === this._validExts[i]) return true;
      }
      return false;
    }
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    var allArgs = ["-jar", this._jarPath].concat(this._extraArgs, args);
    super.run(terminal, allArgs, cb);
  }
}

export class JavaClassCommand extends JavaCommand {
  private _cmd: string;
  private _classpath: string;
  private _className: string;
  private _extraProgArgs: string[];
  private _extraJvmArgs: string[];
  private _validExts: string[];
  constructor(cmd: string, classpath: string, className: string, extraJvmArgs: string[] = [],
              extraProgArgs: string[] = [], validExts: string[] = []) {
    super();
    this._cmd = cmd;
    this._classpath = classpath;
    this._className = className;
    this._extraProgArgs = extraProgArgs;
    this._extraJvmArgs = extraJvmArgs;
    this._validExts = validExts;
  }
  public getCommand() {
    return this._cmd;
  }
  public getAutocompleteFilter() {
    return (fname: string, isDir: boolean): boolean => {
      if (isDir) return true;
      var dot = fname.lastIndexOf('.');
      var ext = dot === -1 ? '' : fname.slice(dot+1);
      for (var i = 0; i < this._validExts.length; i++) {
        if (ext === this._validExts[i]) return true;
      }
      return false;
    }
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    let allArgs = [].concat(this._extraJvmArgs, ["-cp", `.:${this._classpath}`, this._className], this._extraProgArgs, args);
    console.log(allArgs);
    super.run(terminal, allArgs, cb);
  }
}
