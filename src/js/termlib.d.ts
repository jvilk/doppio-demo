// Type definitions for termlib v1.66
// Project: http://www.masswerk.at/termlib/
// Definitions by: John Vilk <https://jvilk.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module Termlib {
  /**
   * Terminal configuration options.
   */
  export interface ITerminalOptions {
    // terminal's position x in px
    x?: number;
    // terminal's position y in px
    y?: number;
    // id of terminals CSS division
    termDiv?: string;
    // background color (HTML hex value)
    bgColor?: string;
    // frame color (HTML hex value)
    frameColor?: string;
    // frame border width in px
    frameWidth?: number;
    // class name of CSS font definition to use
    fontClass?: string;
    // number of cols per row
    cols?: number;
    // number of rows
    rows?: number;
    // a row's line-height in px
    rowHeight?: number;
    // delay for cursor blinking in milliseconds
    blinkDelay?: number;
    // true for blinking cursor
    crsrBlinkMode?: boolean;
    // true for block-cursor else underscore
    crsrBlockMode?: boolean;
    // handle <DEL> as <BACKSPACE>
    DELisBS?: boolean;
    // handle <TAB> as printable (prints as space)
    printTab?: boolean;
    // handle unicode 0x20AC (Euro sign) as printable
    printEuro?: boolean;
    // handle ^H as <BACKSPACE>
    catchCtrlH?: boolean;
    // close terminal on <ESC>
    closeOnESC?: boolean;
    // prevent consecutive and identical entries in history
    historyUnique?: boolean;
    // terminal id
    // Note: While `id' is not used by the Termninal object, it provides an easy way to identify
    // multiple terminals by the use of "this.id". (e.g.: "if (this.id == 1) startupterm = true;")
    id?: number;
    // prompt string
    ps?: string;
    // string for greeting if no initHandler is used
    greeting?: string;
    // reference to handler for command interpretation
    handler?: () => void;
    // reference to handler called on uncatched special keys
    ctrlHandler?: () => void;
    // reference to handler called at end of init()
    initHandler?: () => void;
    // reference to handler called on close()
    exitHandler?: () => void;
    // text wrapping for write() on/off
    wrapping?: boolean;
    // enable mapping of ANSI escape sequences (SGR only)
    mapANSI?: boolean;
    // force ANSI 30m to be rendered as black (default: fg color)
    ANSItrueBlack?: boolean;
    // String, default text color (color 0), overrides any CSS rules
    textColor?: string;
    // Number, if set, adds a CSS text-shadow with the given number of px.
    // ("text-shadow: 0 0 <textBlur>px <color>"), use this with textColor
    // If the value is an array of numbers, multiple text-shadows will
    // be applied.
    textBlur?: number;
  }

  /**
   * Changes the wrapping behavior of individual characters.
   *
   * Used in TermGlobals.wrapChars
   */
  export const enum CharWrapBehavior {
    WHITE_SPACE = 1,
    WRAP_AFTER = 2,
    WRAP_BEFORE = 3,
    CONDITIONAL_WORD_BREAK = 4
  }

  /**
   * Maps the names of cursor & control keys (e.g. 'LEFT') to a consistent keyCode.
   */
  export type ITermKey = {[keyName: string]: number};

  /**
   * termlib global state and helper methods.
   */
  export interface ITermGlobals {
    /**
     * Defines opening HTML tags for specific terminal styles specified in a style vector.
     */
    termStyleOpen: {[styleType: number]: string};
    /**
     * Defines closing HTML tags for specific terminal styles specified in a style vector.
     */
    termStyleClose: {[styleType: number]: string};
    /**
     * Remaps keyCodes of cursor & control keys to consistent values.
     */
    termKey: ITermKey;
    /**
     * Maps DOM key constants to consistent key codes.
     */
    termDomKeyRef: ITermKey;
    /**
     * Contains the focused/active Terminal instance, which
     * is the target of several method on TermGlobals.
     */
    activeTerm: Terminal;
    /**
     * Sets the keyboard focus to the instance referenced by <termref>.
     * The focus is controlled by `TermGlobals.activeTerm' which may be accessed directly.
     * See also: `Terminal.focus()'
     */
    setFocus(termRef: Terminal): void;
    /**
     * The global flag `TermGlobals.keylock' allows temporary keyboard locking without any
     * other change of state. Use this to free the keyboard for any other resources.
     */
    keylock: boolean;
    /**
     * Converts a number to a string, which is filled at its left with zeros ("0") to the total
     * length of <filedlength>. (e.g.: "TermGlobals.normalize(1, 2)" => "01")
     */
    normalize(n: number, fieldlength: number): string;
    /**
     * Converts a value to a string and fills it to the left with blanks to <fieldlength>.
     */
    fillLeft(value: any, fieldlength: number): string;
    /**
     * Adds blanks at the left of the string <text> until the text would be centered at a line
     * of length <length>. (No blanks are added to the the right.)
     */
    center(text: string, length: number): string;
    /**
     * Replaces all occurences of the string <string1> in <text> with <string2>.
     * This is just a tiny work around for browsers with no support of RegExp.
     */
    stringReplace(str1: string, str2: string, text: string): string;
    /**
     * Inserts the given string at the current cursor position. Use this method to paste a
     * single line of text (e.g.: as part of a command) to the terminal.
     * Returns a boolean value success.
     * (If there is no active terminal, or the terminal is locked or the global keylock
     * `TermGlobals.keylock' is set to `true', the method will return false to indicate
     * its failing. Else the method returns true for success.)
     */
    insertText(str: string): boolean;
    /**
     * Breaks the given string to lines and imports each line to the active terminal.
     * Each line will be imported and executed sequentially (just as a user would have typed
     * it on the keyboard and hit <ENTER> afterwards).
     * Any text in the current command line will be lost.
     * Returns success.
     */
    importEachLine(str: string): boolean;
    /**
     * Imports the given string to the active terminal. The text will be imported as single
     * string and executed once. The text will be available in the terminal's `lineBuffer'
     * property with any line breaks normalized to newlines (\n).
     * As with `TermGlobals.importEachLine()' any text in the current command line will be
     * lost.
     */
    importMultiLine(str: string): boolean;
    /**
     * `TermGlobals.assignStyle()' allows you to install a custom style (new with vers. 1.4).
     * You usually would want to install a new style before opening any instance of Terminal
     * in order to have the style ready for use.
     */
    assignStyle(styleCode: number, markup: string, htmlOpen: string, htmlClose: string): void;

    // prompt for 'more' (default: ' -- MORE -- ')
    lcMorePrompt1: string;
    // style of prompt for 'more'
    lcMorePrompt1Style: number;
    // second prompt for 'more' (default: ' (Type: space to continue, \'q\' to quit)')
    lcMorePrompt2: string;
    // style of second prompt for 'more'
    lcMorePrompt2Style: number;
    // key to abort 'more'
    lcMoreKeyAbort: number;
    // key to continue 'more'
    lcMoreKeyContinue: number;

    /**
     * Assigns a particular CSS color string (e.g. "#000000") to a labeled color (e.g. "blue").
     */
    setColor(label: string, colorstring: string): void;
    /**
     * Get the CSS color string for a given labeled color.
     */
    getColorString(label: string): string;
    /**
     * Get the color code for the given labeled color.
     */
    getColorCode(label: string): number;
    /**
     * Configure the wrapping behavior of individual character codes.
     */
    wrapChars: {[charCode: number]: CharWrapBehavior};
    /**
     * Writes <text> to the DHTML element with id/name <element id>.
     */
    writeElement(elementId: string, text: string): void;
    /**
     * Sets the DHTML element with id/name <element id> to position <x>/<y>.
     */
    setElementXY(elementId: string, x: number, y: number): void;
    /**
     * If <value> evaluates to `true' show DHTML element with id/name <element id> else hide it.
     */
    setVisible(elementId: string, value: boolean): void;
    /**
     * Sets the style.display property of the element with id/name <element id> to the given
     * <value>. (added with v. 1.06)
     */
    setDisplay(elementId: string, value: string): void;
    /**
     * Is the current web browser Safari?
     */
    isSafari: boolean;
    /**
     * Is the current web browser Opera?
     */
    isOpera: boolean;
    /**
     * Maps ANSI codes to termlib markup.
     */
    ANIS_SGR_Codes: {[keyCode: number]: string};
  }

  /**
   * A termlib Terminal.
   */
  export class Terminal {
    /**
     * Creates a terminal with the given options.
     * If not specified, Terminal.prototype.Defaults is used.
     */
    constructor(opts?: ITerminalOptions);
    // Configuration option used to configure the terminal.
    public conf: ITerminalOptions;
    // The contents of the terminal's linebuffer.
    public lineBuffer: string;
    // ASCII value of the current input character.
    public inputChar: number;
    // delay for cursor blinking in milliseconds.
    public blink_delay: number;
    // true for blinking cursor. if false, cursor is static.
    public crsrBlinkMode: boolean;
    public crsrBlockMode: boolean;
    // handle <DEL> as <BACKSPACE>.
    public DELisBS: boolean;
    // handle <TAB> as printable (prints as space)
    // if false <TAB> is handled as a control character
    public printTab: boolean;
    // handle the euro sign as valid input char.
    // if false char 0x20AC is printed, but not accepted
    // in the command line
    public printEuro: boolean;
    // handle ^H as <BACKSPACE>.
    // if false, ^H must be tracked by a custom
    // ctrlHandler.
    public catchCtrlH: boolean;
    // close terminal on <ESC>.
    // if true, <ESC> is not available for ctrHandler.
    public closeOnESC: boolean;
    // unique history entries.
    // if true, entries that are identical to the last
    // entry in the user history will not be added.
    public historyUnique: boolean;
    // terminal in character mode (tracks next key-code).
    // (runtime only)
    public charMode: boolean;
    // terminal in raw mode (no echo, no editing).
    // (runtime only)
    public rawMode: boolean;
    // text wrapping on/off
    public wrapping: boolean;
    // filter ANSI escape sequences and apply SGR styles
    // and color codes for write()
    public mapANSI: boolean;
    // force output of ANSI code 30m (black) as black
    // (default: render color 0 as foreground color)
    public ANSItrueBlack: boolean;
    // prompt string.
    public ps: string;
    // if true, the terminal has been closed via its close() method
    // closed terminals can be re-entered via its open() method
    public closed: boolean;
    // maximum number of columns to display
    public maxCols: number;
    // maximum number of rows to display
    public maxLines: number;
    // if true, the terminal is locked and does not accept input.
    public lock: boolean;

    /**
     * Default terminal configuration.
     */
    public Defaults: ITerminalOptions;
    /**
     * Global terminal settings. Shared with all Terminal instances.
     */
    public globals: ITermGlobals;
    /**
     * Terminal's default handler.
     */
    public defaultHandler: () => void;
    /**
     * Alias for globals.termKey
     */
    public termKey: ITermKey;

    /**
     * Types the string <text> at the current cursor position to the terminal. Long lines are
     * broken where the last column of the terminal is reached and continued in the next line.
     * `Terminal.write()' does not support any kind of arbitrary line breaks. (This is just a
     * basic output routine. See `Terminal.write()' for a more powerful output method.)
     *
     * A bitvector may be supplied as an optional second argument to represent a style or a
     * combination of styles. The meanings of the bits set are interpreted as follows:
     *
     * <stylevector>:
     *
     *   1 ... reverse    (2 power 0)
     *   2 ... underline  (2 power 1)
     *   4 ... italics    (2 power 2)
     *   8 ... strike     (2 power 3)
     *  16 ... bold       (2 power 4)  *displayed as italics, used internally for ANSI-mapping*
     *
     * Color values correspond to the bytes 8 to 11 (bitmask xf00) of
     * the style-vector.
     */
    public type(text: string, stylevector?: number): void;
    /**
     * Writes a text with markup to the terminal. If an optional second argument evaluates to
     * true, a UN*X-style utility like `more' is used to page the text. The text may be supplied
     * as a single string (with newline character "\n") or as an array of lines. Any other input
     * is transformed to a string value before output.
     *
     * See README for further details.
     */
    public write(text: string, usemore?: boolean): void;
    /**
     * Output the string <text> at row <r>, col <c>.
     */
    public typeAt(r: number, c: number, text: string, stylevector?: number): void;
    /**
     * Output a single character represented by the ASCII value of <charcode> at row <r>, col <c>.
     * For <stylevector> see `Terminal.type()'.
     */
    public setChar(charcode: number, r: number, c: number, stylevector?: number): void;
    /**
     * Prints a newline to the terminal.
     */
    public newLine(): void;
    /**
     * Clears the terminal screen. (Returns with cursor off.)
     */
    public clear(): void;
    /**
     * All output acts on a logical screen with the origin at row 0 / col 0. While the origin is
     * fixed, the logical width and height of the terminal are defined by `Terminal.maxCols' and
     * `Terminal.maxLines'. These are set to the configuration dimensions at initilization and by
     * `Terminal.reset()', but may be altered at any moment. Please note that there are no bounds
     * checked, so make sure that `Terminal.maxCols' and `Terminal.maxLines' are less or equal
     * to the configuration dimensions.
     *
     * You may want to decrement `Terminal.maxLines' to keep space for a reserved status line.
     * `Terminal.statusLine( <text>, <style> )' offers a simple way to type a text to the last
     * line of the screen as defined by the configuration dimensions.
     */
    public statusLine(text: string, stylevector?: number, lineoffset?: number): void;
    /**
     * Outputs the string <text> to row <r> in the style of an optional <stylevector>.
     * If the string's length exceeds the length of the row  (up to `Terminal.conf.cols'), extra
     * characteres are ignored, else any extra space is filled with character code 0 (prints as
     * <SPACE>).
     * The valid range for <row> is: 0 >= <row> < `Terminal.maxLines'.
     * `Terminal.printRowFromString()' does not set the cursor.
     *
     * You could, for example, use this method to output a line of a text editor's buffer.
     */
    public printRowFromString(r: number, text: string, stylevector?: number): void;
    /**
     * Basic function to redraw a terminal row <row> according to screen buffer values.
     * For hackers only. (e.g.: for a console game, hack screen buffers first and redraw all
     * changed rows at once.)
     */
    public redraw(row: number): void;
    /**
     * Turns automatic text wrapping ON.
     *
     * Text wrapping is OFF by default.
     */
    public wrapOn(): void;
    /**
     * Turns automatic text wrapping OFF.
     *
     * Text wrapping is OFF by default.
     */
    public wrapOff(): void;
    /**
     * Escape any termlib markup in the given string (e.g. % strings).
     *
     * Useful for printing ANSI documents / output.
     *
     * All ANSI-code-to-markup-mapping is defined in the static object
     * "Terminal.prototype.globals.ANIS_SGR_codes" (or short: "TermGlobals.ANIS_SGR_codes").
     */
    public escapeMarkup(ansiEncodedText: string): string;

    /** CURSOR METHODS AND EDITING **/

    /**
     * Show the cursor.
     */
    public cursorOn(): void;
    /**
     * Hide the cursor.
     */
    public cursorOff(): void;
    /**
     * Set the cursor position to row <r> column <c>.
     * `Terminal.cursorSet()' preserves the cursor's active state (on/off).
     */
    public cursorSet(r: number, c: number): void;
    /**
     * Move the cursor left. (Movement is restricted to the logical input line.)
     * `Terminal.cursorLeft()' preserves the cursor's active state (on/off).
     */
    public cursorLeft(): void;
    /**
     * Move the cursor right. (Movement is restricted to the logical input line.)
     * `Terminal.cursorRight()' preserves the cursor's active state (on/off).
     */
    public cursorRight(): void;
    /**
     * Delete the character left from the cursor, if the cursor is not in first position of the
     * logical input line.
     * `Terminal.backspace()' preserves the cursor's active state (on/off).
     */
    public backspace(): void;
    /**
     * Delete the character under the cursor.
     * `Terminal.fwdDelete()' preserves the cursor's active state (on/off).
     */
    public fwdDelete(): void;
    /**
     * Returns `true' if the character represented by <key code> is printable with the current
     * settings. An optional second argument <unicode page 1 only> limits the range of valid
     * values to 255 with the exception of the Euro sign, if the flag `Terminal.printEuro' is set.
     * (This second flag is used for input methods but not for output methods. So you may only
     * enter portable characters, but you may print others to the terminals screen.)
     */
    public isPrintable(keyCode: number, unicodePage1Only?: boolean): void;
    /**
     * Performs the following actions:
     *
     * advance the cursor to a new line, if the cursor is not at 1st column
     * type the prompt string (as specified in the configuaration object)
     * show the cursor
     * unlock the terminal
     *
     * (The value of the prompt string can be accessed and changed in `Terminal.ps'.)
     */
    public prompt(): void;
    /**
     * Resets the terminal to sane values and clears the terminal screen.
     */
    public reset(): void;

    /**
     * Opens the terminal. If this is a fresh instance, the HTML code for the terminal is
     * generated. On re-entry the terminal's visibility is set to `true'. Initialization tasks
     * are performed and the optional initHandler called. If no initHandler is specified in the
     * configuration object, the greeting (configuration or default value) is shown and the user
     * is prompted for input.
     *
     * Returns success if the target HTML element exists.
     */
    public open(): boolean;
    /**
     * Closes the terminal and hides its visibility. An optional exitHandler (specified in the
     * configuration object) is called, and finally the flag `Terminal.closed' is set to true. So
     * you can check for existing terminal instances as you would check for a `window' object
     * created by `window.open()'.
     */
    public close(): void;
    /**
     * Set the keyboard focus to this instance of Terminal. (As `window.focus()'.)
     */
    public focus(): void;
    /**
     * Move the terminal to position <x>/<y> in px.
     * (As `window.moveTo()', but inside the HTML page.)
     */
    public moveTo(x: number, y: number): void;
    /**
     * Resize the terminal to dimensions <x> cols and <y> rows.
     * <x> must be at least 4, <y> at least 2.
     * `Terminal.resizeTo()' resets `Terminal.conf.rows', `Terminal.conf.cols',
     * `Terminal.maxLines', and `Terminal.maxCols' to <y> and <x>, but leaves the instance' state
     * else unchanged. Clears the terminal's screen and returns success.
     */
    public resizeTo(x: number, y: number): void;
    /**
     * Returns an object with properties "width" and "height" with numeric values for the
     * terminal's outer dimensions in px. Values are zero (0) if the element is not present or
     * if the method fails otherwise.
     */
    public getDimensions(): { width: number; height: number };
    /**
     * Rebuilds the Terminal object's GUI preserving its state and content.
     * Use this to change the color theme on the fly.
     */
    public rebuild(): void;
    /**
     * Backups the current terminal screen, state, and handlers to the internal object
     * "backupBuffer". Use this if you want to go full screen or if you want to display an
     * interactive dialog or a warning. Use `Terminal.restoreScreen()' to restore the former
     * state of the terminal instance. (See the file "sample_globbing.html" for an example.)
     *
     * Please note that any call of method `Terminal.rebuild()' will clear the buckup buffer
     * to avoid any errors or undefined cases resulting from changing screen sizes.
     */
    public backupScreen(): void;
    /**
     * Restores a terminal instance from a backup made by a previous call to
     * `Terminal.backupScreen()'. This resets the screen, the terminal's state and handlers.
     */
    public restoreScreen(): void;
    /**
     * Swaps the backup buffer and the current state of the terminal instance. (E.g.: do/undo)
     * If the backup buffer is empty (null), just like `Terminal.backupScreen()'.
     */
    public swapBackup(): void;
    /**
     * Sets the default color (term.textColor) explicitely to the given color and redraws the terminal.
     * The default color corresponds to color 0 and overrides any CSS rules defined eleswhere.
     */
    public setTextColor(cssColorString: string): void;
    /**
     * Sets the text-blur-radius (term.textBlur) to the given number and redraws the terminal.
     * (Accepted range: 0 .. 40.) If set, a css-text "text-shadow: 0 0 <radius>px <color>" will be
     * added to the output. Set option "textColor" when using this in order to provide a color
     * information for the default color.
     *
     * If <radius> is an array of numbers, multiple text-shadow styles will be applied. Thus the
     * call "setTextBlur(2, 18)" will result in the css-text:
     * "text-shadow: 0 0 2px <color>, 0 0 18px <color>".
     */
    public setTextBlur(radius: number): void;
  }
}

declare var Terminal: typeof Termlib.Terminal;
/**
 * Alias for Terminal.prototype.defaultHandler.
 */
declare var termDefaultHandler: () => void;
/**
 * Alias for Terminal.prototype.globals
 */
declare var TermGlobals: Termlib.ITermGlobals;
/**
 * Alias for Terminal.prototype.Defaults.
 */
declare var TerminalDefaults: Termlib.ITerminalOptions;
/**
 * Alias for TermGlobals.termKey.
 */
declare var termKey: Termlib.ITermKey;
/**
 * Alias for TermGlobals.termDomKeyRef.
 */
declare var termDomKeyRef: Termlib.ITermKey;
