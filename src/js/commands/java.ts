import {AbstractShellCommand} from './meta';
import Shell from '../shell';
import BrowserFS = require('browserfs');
(<any> global)['BrowserFS'] = BrowserFS;

import DoppioJVM = require('doppiojvm');
import _ = require('underscore');
import JVMCLIOptions = DoppioJVM.VM.Interfaces.JVMCLIOptions;

/**
 * Construct a JavaOptions object with the default demo fields filled in.
 * Optionally merge it with the custom arguments specified.
 */
function constructJavaOptions(customArgs: { [prop: string]: any } = {}): JVMCLIOptions {
  return _.extend(DoppioJVM.VM.JVM.getDefaultOptions('/sys'), {
    extractionPath: '/jars'
  }, customArgs);
}


export class JavaCommand extends AbstractShellCommand {
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
  public run(terminal: Shell, args: string[], cb: () => void): void {
    DoppioJVM.VM.CLI(args, constructJavaOptions({
      launcherName: this.getCommand()
    }), cb);
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
  private _extraArgs: string[];
  private _validExts: string[];
  constructor(cmd: string, classpath: string, className: string,
              extraArgs: string[] = [], validExts: string[] = []) {
    super();
    this._cmd = cmd;
    this._classpath = classpath;
    this._className = className;
    this._extraArgs = extraArgs;
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
    var allArgs = ["-cp", `.:${this._classpath}`, this._className].concat(this._extraArgs, args);
    super.run(terminal, allArgs, cb);
  }
}
