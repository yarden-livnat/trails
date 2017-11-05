import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function trails(stream: any, state: any) {
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
