import 'codemirror/lib/codemirror.css';
import '../style/editor.css';

import * as CodeMirror from 'codemirror';

import './mode';
import './fold';
import './overview';

let defaults = {
  mode: 'trails-sql',
  dialect: 'mssql',
  lineNumbers: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  overview: true
}

let defaultExtraKeys: any = {
  'Cmd-/': 'toggleComment',
  'Ctrl-/': 'toggleComment',
}

export
function Editor(node : HTMLElement, options: CodeMirror.EditorConfiguration) : CodeMirror.Editor {
  let opt = {
    ...defaults,
    ...options,
    extra_keys: {
      ...defaultExtraKeys,
      ...options.extraKeys
    }
  };

  return ('type' in node && (node as any)['type'] == 'textarea') ?
    CodeMirror.fromTextArea(node as HTMLTextAreaElement, opt) : CodeMirror(node, opt);
}
