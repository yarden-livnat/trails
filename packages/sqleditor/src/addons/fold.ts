import * as CodeMirror from 'codemirror';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/comment-fold';

let CM : any = CodeMirror;
CM.registerHelper('fold', 'trails', (cm: any, start: any) => {
  let pos = CodeMirror.Pos(start.line, 0);

  if (cm.getTokenTypeAt(pos) != 'decorator') return;

  let from = cm.getLineTokens(pos.line)[1];

  let last = cm.lastLine();
  while (++pos.line <= last) {
    if (cm.getTokenTypeAt(pos) != 'decorator') continue;
    let to = cm.getLineTokens(pos.line)[1];
    if (to.start > from.start) continue;
    if (to.start < from.start) break;
    if (from.string == '@block' && to.string != '@block') continue;
    break;
  }

  return {
    from: CodeMirror.Pos(start.line, cm.getLine(start.line).length),
    to: CodeMirror.Pos(pos.line-1, cm.getLine(pos.line-1).length)
  }
});
