

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import * as CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import 'codemirror/addon/runmode/runmode';
import 'codemirror/mode/sql/sql';

import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/scroll/scrollpastend.js';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
// import 'codemirror/keymap/emacs.js';
// import 'codemirror/keymap/sublime.js';
// import 'codemirror/keymap/vim.js';

import {
  SQLModel, ISQLModel
} from './model';

const EDITOR_CLASS = 'trails-editor';
const HAS_SELECTION_CLASS = 'trails-mode-has-primary-selection';


let default_config = {
  // autoClosingBrackets: true,
  // coverGutterNextToScrollbar: false,
  // dragDrop: true,
  // electricChars: true,
  // fixedGutter: true,
  // // gutters: Object.freeze([]),
  // keyMap: 'default',
  // insertSpaces: true,
  lineNumbers: true,
  // lineSeparator: null as string,
  // lineWiseCopyCut: true,
  // lineWrap: true,
    //  matchBrackets: true,
  // readOnly: false,
  // scrollbarStyle: 'native',
  // scrollPastEnd: false,
  // showCursorWhenSelecting: false,
  smartIndent: true,
  // tabSize: 4,
};

let extra_keys = {

}

let config = {

  ...default_config,
  ...extra_keys
}

export
class SQLEditor extends Widget {
  constructor(options: SQLEditor.IOptions = {}) {
    super();
    this.addClass(EDITOR_CLASS);

    let editor = this.editor = CodeMirror(this.node, {
        mode: 'text/x-mssql',
        ...default_config,
        extraKeys: {
          'Cmd-Right': 'goLineLeft',
          'End': 'goLineRight',
          'Cmd-Left': 'goLineLeft',
          'Tab': 'indentMoreOrinsertTab',
          'Shift-Tab': 'indentLess',
          'Cmd-/': 'toggleComment',
          'Ctrl-/': 'toggleComment',
          'Shift-Enter': () => { this.exec();  },
        },
    });
    editor.on('changes', (instance, changes) => {
      console.log('changes', changes);
    });
  }

  readonly editor: CodeMirror.Editor;

  exec() {
    console.log('exec');
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    // this.editor.dispose();
  }

  // private onChange(cm: CodeMirror.Editor, changes: [<object>]) {
  //   console.log('on changes', change);
  // }

  protected onActivateRequest(msg: Message): void {
    this.editor.focus();
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    if (this.isVisible) {
      this.update();
    }
  }

  protected onAfterShow(msg: Message): void {
    this.update();
  }

  protected onResize(msg: Widget.ResizeMessage): void {
    // if (msg.width >= 0 && msg.height >= 0) {
    //   this.editor.setSize(msg);
    // } else if (this.isVisible) {
    //   this.editor.resizeToFit();
    // }
  }

  protected onUpdateRequest(msg: Message): void {
    // this.editor.refresh();
  }

  private _onSelectionsChanged(): void {
    // const { start, end } = this.editor.getSelection();
    //
    // if (start.column !== end.column || start.line !== end.line) {
    //   this.addClass(HAS_SELECTION_CLASS);
    // } else {
    //   this.removeClass(HAS_SELECTION_CLASS);
    // }
  }
}



export
namespace SQLEditor {
  export interface IOptions {
    // config?: Partial<CodeEditor.IConfig>;
  }
}
