import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

let patterns = {
  'from': /\sfrom\s+((#?[\[\]\.\w]+)(?:\s,\s)*)+/gi,
  'into': /\sinto\s+(#?[\[\]\.\w]+)/gi
}

let names = Object.keys(patterns);

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function trails(stream: any, state: any) {
    if (stream.peek() == ';') {
      stream.next();
      return "semicolon";
    }
    // for (let name of names) {
    //   let m = stream.match(patterns[name])
    //   if (m)
    // }
    if (stream.sol() && stream.match(/-- (?=@)/)) {
      state.context = {
        prev: state.context,
        type: 'pre-block'
      }
      return 'pre-block';
    } else if (state.context && state.context.type == 'pre-block') {
        state.context = state.prev;
        let m = stream.match(/@(block|table|procedure)(?= |$)/);
        if (m) {
          return m[1] == 'block' ? 'block' : 'block-'+m[1];
        }
        stream.match(/@\w*/);
        return 'block-error';
    }
    return null;
  }

  return {
    startState: function() {
      return sql.startState();
    },
    token: function(stream, state) {
      return trails(stream, state) || sql.token(stream, state);
    },
    indent: sql.indent,
    blockCommentStart: sql.blockCommentStart,
    blockCommentEnd: sql.blockCommentEnd,
    lineComment: sql.lineComment,
    fold: 'trails',
  }
});
