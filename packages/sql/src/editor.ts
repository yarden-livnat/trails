

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

// import 'codemirror/mode/meta';
// import 'codemirror/addon/scroll/scrollpastend.js';


import {
  SQLModel, ISQLModel
} from './model';

import { Editor, Bookmark } from '@trails/editor';

const EDITOR_CLASS = 'trails-editor';
const HAS_SELECTION_CLASS = 'trails-mode-has-primary-selection';


export
class SQLEditor extends Widget {
  constructor(options: SQLEditor.IOptions = {}) {
    super();
    this.addClass(EDITOR_CLASS);

    let editor = this.editor = Editor(this.node, {
      extraKeys: {
        'Shift-Enter': () => { this.exec(); },
      }
    });
  }

  on(event: 'structure', cb: (bookmark: Bookmark[]) => void) {
    this.editor.on('structure', (cm: CodeMirror.Editor, bookmarks?:Bookmark[]) => {
      cb(bookmarks);
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
  }


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
    // console.log('resize', msg.width, msg.height);
    // this.editor.setSize(msg.width, msg.height)
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
