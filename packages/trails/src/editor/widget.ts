import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  CodeEditor, IEditorServices
} from '@jupyterlab/codeeditor';

import {
  FileEditor
} from '@jupyterlab/fileeditor';

import {
  Signal
} from '@phosphor/signaling';

import {
  IStructureItem, Structure
} from './structure';

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/dialog/dialog';
// import 'codemirror/addon/display/autorefresh';
// import 'codemirror/addon/comment/comment';
import './addons/mode';
import './addons/fold';
import './addons/structure';


import {
  Bookmark
} from './addons/bookmark';

import '../../style/editor.css';

/**
 * The class name added to a dirty widget.
 */
const DIRTY_CLASS = 'jp-mod-dirty';

/**
 * The class name added to a jupyter editor widget.
 */
const EDITOR_CLASS = 'vatrails-SQLEditor';


let config = {
  mode: 'vatrails-sql',
  dialect: 'mssql',
  mimeType: 'text/vatrails-sql',
  lineNumbers: true,
  // // smartIndent: true,
  // autoRefresh:true,
  // overGutterNextToScrollbar: false,
  scrollbarStyle: 'native',
  // // fixedGutter: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  // gutters: ["CodeMirror-foldgutter"],
  structure: true,
  extraKeys: {
    'Cmd-0': function(cm){ cm.foldCode(cm.getCursor()); },
    'Cmd-/': 'toggleComment',
    'Ctrl-/': 'toggleComment',
    Tab: function(cm) {
      let spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
      cm.replaceSelection(spaces);
      }
  },
};


/**
 * A document widget for editors.
 */
export
class SQLEditor extends FileEditor {
  constructor(options: FileEditor.IOptions) {
    super(options);
    this.removeClass('jp-FileEditor');
    this.addClass(EDITOR_CLASS);

    console.log('New sql editor');
    if (options.context.path) this.id = options.context.path;

    let editor = this.editor['editor'];

    let extraKeys = editor.getOption('extraKeys') || {};
    extraKeys['Shift-Enter'] =  () => this.exec();
    editor.setOption('extraKeys', extraKeys);


    CodeMirror.on(editor, 'structure', (sender: any, data:any) => {
      this.structure.items = data as IStructureItem[];
      this.structureChanged.emit(this.structure);
    });

    CodeMirror.on(editor, 'structure.update', (sender: any, data:any) => {
      this.structureChanged.emit(this.structure);
    });
  }

  exec() {
    console.log('exec called but it is tbd');
  }

  public highlight( item: IStructureItem, state:boolean) {
    let editor = this.editor['editor'];
    let bookmark = item as Bookmark;
    let line = (bookmark.find() as any).from.line;
    if (state) editor.addLineClass(line, 'background', 'vatrails-SQLEditor-highlight');
    else  editor.removeLineClass(line, 'background', 'vatrails-SQLEditor-highlight');
  }

  public revile(item: IStructureItem) {
    let editor = this.editor['editor'];
    let bookmark = item as Bookmark;
    let range = bookmark.find();

    range.to.line = this.find_next(bookmark, editor) || editor.lastLine();

    editor.scrollIntoView(range);
  }

  public getSQLSelection(): string {
    let sql = "";

    let cm = this.editor['editor'];
    if (cm.somethingSelected()) {
      sql = cm.getSelection()
    } else {
      const pos = cm.getCursorPosition();
      let bookmark = cm.findMarks(this.Pos(pos.line,0), this.Pos(pos.line+1, 0));
      if (bookmark) {
        console.log('mark =', bookmark);
      }

    }
    return sql;
  }

  Pos(l,c) {
    return CodeMirror.Pos(l,c);
  }

  fold(item: IStructureItem) {
    let editor = this.editor['editor'];
    let bookmark = item as Bookmark;
    let at = (bookmark.find() as any).from;
    editor.foldCode(at);
  }

  readonly structureChanged = new Signal<this, Structure>(this);

  readonly structure: Structure = new Structure;
  readonly foo:string = 'foo';

  find_next(bookmark, editor) {
    let bookmarks = editor.state && editor.state.structure && editor.state.structure.bookmarks;
    if (!bookmarks) return null;

    let base = bookmark.level;
    let inBlock = bookmark.type == 'Block';

    for (let i = bookmarks.indexOf(bookmark)+1; i < bookmarks.length; i++) {
      let next = bookmarks[i];
      if (next.level > base) continue;
      if (next.level < base || !inBlock || next.type == 'Block') {
        return next.find().from.line;
      }
    }
    return null;
  }

}

export
class SQLEditorFactory extends ABCWidgetFactory<SQLEditor, DocumentRegistry.ICodeModel> {
  /**
   * Construct a new editor widget factory.
   */
  constructor(options: SQLEditorFactory.IOptions) {
    super(options.factoryOptions);
    this._services = options.editorServices;
  }

  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(context: DocumentRegistry.CodeContext): SQLEditor {
    let func = this._services.factoryService.newDocumentEditor.bind(
      this._services.factoryService);
    let factory: CodeEditor.Factory = options => {
      return func({...options, config});
    };
    // context.model.mimeType = 'text/x-trails';
    return new SQLEditor({
      factory,
      context,
      mimeTypeService: this._services.mimeTypeService
    });
  }

  private _services: IEditorServices;
}

/**
 * The namespace for `SQLEditorFactory` class statics.
 */
export
namespace SQLEditorFactory {
  /**
   * The options used to create an editor widget factory.
   */
  export
  interface IOptions {
    /**
     * The editor services used by the factory.
     */
    editorServices: IEditorServices;

    /**
     * The factory options associated with the factory.
     */
    factoryOptions: DocumentRegistry.IWidgetFactoryOptions;
  }
}
