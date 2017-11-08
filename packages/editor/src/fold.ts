import * as CodeMirror from 'codemirror';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/comment-fold';

function isBlock(cm, line) {
  console.log('isBlock:', line, cm.getLineTokens(line));
  return cm.getTokenTypeAt(CodeMirror.Pos(line, 0)) == 'line-annotation';
  // let tokens = cm.getLineTokens(line);
  // console.log(`isBlock [${line}]`, tokens);
  // return tokens.length > 1 && tokens[0] == 'soa' && tokens[1] == 'block';
}

CodeMirror.registerHelper('fold', 'trails', (cm: any, start: any) => {
  let line = start.line;

  if (!isBlock(cm, line)) return;

  let from = CodeMirror.Pos(line, cm.getLine(line).length);
  let end = cm.lastLine();
  while (++line <= end && !isBlock(cm, line));

  return {
    from: from,
    to: CodeMirror.Pos(line-1,cm.getLine(line-1).length)
  }

  // let tokens = cm.getLineTokens(start.line);
  // console.log('tokens', tokens);
  // if (tokens.length > 1 && tokens[0] == 'pre' && tokens[1] == 'block') {
  //   let end = cm
  // }
  //
  // let text = cm.getLine(line);
  // if (!/^-- @/.test(text)) return;
  //
  // let from = CodeMirror.Pos(line, cm.getLine(line).length);
  // let end = cm.lastLine();
  // while (++line <= end && !/^-- @/.test(cm.getLine(line)));
  //
  // return {
  //   from: from,
  //   to: CodeMirror.Pos(line-1,cm.getLine(line-1).length)
  // }
});
