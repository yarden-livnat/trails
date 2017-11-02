

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import {
  CodeEditor
} from '@jupyterlab/codeeditor';

import {
  CodeMirrorEditorFactory
} from '@jupyterlab/codemirror';

import {
  SQLModel, ISQLModel
} from './model';

const EDITOR_CLASS = 'trails-editor';
const HAS_SELECTION_CLASS = 'trails-mode-has-primary-selection';

export
class SQLEditor extends Widget {
  constructor(options: SQLEditor.IOptions = {}) {
    super();
    this.addClass(EDITOR_CLASS);

    let factory = createFactory();
    this.editor = factory({
      host: this.node,
      model: new SQLModel({})
    });
    this.editor.model.selections.changed.connect(this._onSelectionsChanged, this);
  }

  readonly editor: CodeEditor.IEditor;;

  get model(): CodeEditor.IModel {
    return this.editor.model;
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this.editor.dispose();
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
    if (msg.width >= 0 && msg.height >= 0) {
      this.editor.setSize(msg);
    } else if (this.isVisible) {
      this.editor.resizeToFit();
    }
  }

  protected onUpdateRequest(msg: Message): void {
    this.editor.refresh();
  }

  private _onSelectionsChanged(): void {
    const { start, end } = this.editor.getSelection();

    if (start.column !== end.column || start.line !== end.line) {
      this.addClass(HAS_SELECTION_CLASS);
    } else {
      this.removeClass(HAS_SELECTION_CLASS);
    }
  }
}

function createFactory(): CodeEditor.Factory {
  let factory = new CodeMirrorEditorFactory({
    mode: 'sql'
  });
  return factory.newDocumentEditor.bind(factory);
}

export
namespace SQLEditor {
  export interface IOptions {
    config?: Partial<CodeEditor.IConfig>;
  }
}
