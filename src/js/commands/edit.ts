import {AbstractShellCommand} from './meta';
import Shell from '../shell';
import BrowserFS = require('browserfs');
const fs = BrowserFS.BFSRequire('fs');

export default class EditCommand extends AbstractShellCommand {
  private _consoleElement: JQuery;
  private _filenameElement: JQuery;
  private _editorContainer: JQuery;
  private _saveButtonElement: JQuery;
  private _closeButtonElement: JQuery;
  private _editor: AceAjax.Editor;
  private _isInitialized: boolean = false;
  private _lastCb: () => void;
  constructor(editorElementName: string, saveButtonElement: JQuery, closeButtonElement: JQuery, editorContainer: JQuery, consoleElement: JQuery, filenameElement: JQuery) {
    super();
    this._consoleElement = consoleElement;
    this._filenameElement = filenameElement;
    this._editorContainer = editorContainer
    this._saveButtonElement = saveButtonElement;
    this._closeButtonElement = closeButtonElement;

    // Initiaize AceEdit.
    this._editor = ace.edit(editorElementName);
    this._editor.setTheme('ace/theme/twilight');
  }

  private initialize(terminal: Shell) {
    if (!this._isInitialized) {
      this._isInitialized = true;
      this._saveButtonElement.click((e: JQueryEventObject) => {
        var fname = this._filenameElement.val();
        var contents = this._editor.getSession().getValue();
        if (contents[contents.length - 1] !== '\n') {
          contents += '\n';
        }
        fs.writeFile(fname, contents,(err: Error) => {
          if (err) {
            terminal.stderr(`File could not be saved: ${err}\n`);
          } else {
            terminal.stdout(`File saved as '${fname}'.\n`);
          }
          if (this._lastCb != null) {
            this._lastCb();
            this._lastCb = null;
          }
        });
        this.closeEditor();
        e.preventDefault();
      });
      this._closeButtonElement.click((e: JQueryEventObject) => {
        this.closeEditor();
        if (this._lastCb != null) {
          this._lastCb();
          this._lastCb = null;
        }
        e.preventDefault();
      });
    }
  }

  private closeEditor() {
    this._editorContainer.fadeOut('fast', () => {
      // click to restore focus
      this._consoleElement.fadeIn('fast').click();
    });
  }

  public getCommand() {
    return "edit";
  }
  public run(terminal: Shell, args: string[], cb: () => void): void {
    this.initialize(terminal);

    var startEditor = (data: string): void => {
      const consoleHeight = this._consoleElement.height();
      this._consoleElement.fadeOut('fast', (): void => {
        this._filenameElement.val(args[0]);
        this._editorContainer.height(consoleHeight);
        this._editorContainer.fadeIn('fast');
        if (args[0] == null || args[0].split('.')[1] === 'java') {
          var JavaMode = ace.require("ace/mode/java").Mode;
          this._editor.getSession().setMode(new JavaMode);
        } else {
          var TextMode = ace.require("ace/mode/text").Mode;
          this._editor.getSession().setMode(new TextMode);
        }
        this._editor.getSession().setValue(data);
      });
    };

    if (args[0] == null) {
      startEditor(this.defaultFile('Test.java'));
      this._lastCb = cb;
    } else {
      fs.readFile(args[0], 'utf8',(err: Error, data: string): void => {
        if (err) {
          startEditor(this.defaultFile(args[0]));
        } else {
          startEditor(data);
        }
        this._lastCb = cb;
      });
    }
  }

  private defaultFile(filename: string): string {
    if (filename.indexOf('.java', filename.length - 5) != -1) {
      var lastSlash = filename.lastIndexOf('/');
      return `class ${filename.substring(lastSlash+1, filename.length-5)} {
  public static void main(String[] args) {
    // enter code here
  }
}`;
    }
    return "";
  }
}

