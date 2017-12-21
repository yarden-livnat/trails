
import {
  CodeEditor, CodeEditorWrapper
} from '@jupyterlab/codeeditor';

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import './addons/mode';
import './addons/fold';
import './addons/structure';

const EDITOR_CLASS = 'sql-editor';

let config = {
  mode: 'trails-sql',
  dialect: 'mssql',
  mimeType: 'text/trails-sql',
  lineNumbers: true,
  smartIndent: true,
  autoRefresh:true,
  overGutterNextToScrollbar: false,
  scrollbarStyle: 'native',
  fixedGutter: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  structure: true,
  extraKeys: {
    'Cmd-0': function(cm){ cm.foldCode(cm.getCursor()); },
    'Cmd-/': 'toggleComment',
    'Ctrl-/': 'toggleComment',
  },
}


export
class EditorWidget extends CodeEditorWrapper {
  constructor(options) {
    super({
      ...options,
      config: config
    });

    this.addClass(EDITOR_CLASS);
  }

  getOption(key: string) : object {
    let cm = this.editor as CodeMirror;
    return cm.getOption(key);
  }

  setOption(key: string, value: object): void {
    let cm = this.editor as CodeMirror;
    cm.setOption(key, value);
  }

  on(type, cb: (data?:any) => void) {
    CodeMirror.on(this.editor['editor'], type, (cm: CodeMirror.Editor, data?:any) => cb(data));
  }
}
