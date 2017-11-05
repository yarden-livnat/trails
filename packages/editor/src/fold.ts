import 'codemirror/addon/fold/foldgutter.css';

import * as CodeMirror from 'codemirror';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/comment-fold';

CodeMirror.registerHelper('fold', 'trails', (cm: any, start: any) => {
  let line = start.line;
  let text = cm.getLine(line);
  if (!/^-- @/.test(text)) return;

  let from = CodeMirror.Pos(line, cm.getLine(line).length);
  let end = cm.lastLine();
  while (++line <= end && !/^-- @/.test(cm.getLine(line)));

  return {
    from: from,
    to: CodeMirror.Pos(line-1,cm.getLine(line-1).length)
  }
});
