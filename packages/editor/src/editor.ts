// import 'codemirror/lib/codemirror.css';
import '../style/editor.css';

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import './mode';
import './fold';
import './overview';
import './structure';

let defaults = {
  mode: 'trails-sql',
  dialect: 'mssql',
  lineNumbers: true,
  smartIndent: true,
  // viewportMargin: Infinity,
  autoRefresh:true,
  overGutterNextToScrollbar: false,
  scrollbarStyle: 'native',
  fixedGutter: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  // overview: true,
  // structure: true,
  extraKeys: {
    'Cmd-0': function(cm){ cm.foldCode(cm.getCursor()); },
    'Cmd-/': 'toggleComment',
    'Ctrl-/': 'toggleComment',
  },
}


export
function Editor(node : HTMLElement, options: CodeMirror.EditorConfiguration) : CodeMirror.Editor {
  // let opt = {
  //   ...defaults,
  //   extra_keys: {
  //     'Cmd-[': function(cm){ console.log('fold'); cm.foldCode(cm.getCursor()); },
  //     'Cmd-/': 'toggleComment',
  //     'Ctrl-/': 'toggleComment',
  //   },
  //   // ...options
  // };
  let opt = defaults;

  return ('type' in node && (node as any)['type'] == 'textarea') ?
    CodeMirror.fromTextArea(node as HTMLTextAreaElement, opt) : CodeMirror(node, opt);
}
