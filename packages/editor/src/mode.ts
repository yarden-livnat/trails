import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

const pre = {style: 'pre-block', pattern: /--\s+(?=@)/};
const post = {style: 'post-block', pattern: /$/};

let annotations = [
  {style: 'annotation block', pattern: /^@block(?: |$)/},
  {style: 'annotation', pattern: /^@into(?: |$)/},
  {style: 'annotation', pattern: /^@into(?: |$)/},
  {style: 'annotation', pattern: /^@into(?: |$)/},
  {style: 'annotation', pattern: /^@into(?: |$)/},
  {style: 'annotation', pattern: /^@proc|@procedure|@function(?: |$)/},
];

let keywords = [
  {style: 'keyword', pattern: /^GO/i},
  {style: 'semicolon', pattern: /^;/}
];

let keys = Object.keys(annotations);

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function trails(stream: any, state: any) {
    if (!state.active) {
      if (stream.match(pre.pattern)) {
        state.active = true;
        return pre.style;
      }
      for (let keyword of keywords) {
        if (stream.match(keyword.pattern)) {
          return keyword.style;
        }
      }
      return null;
    }
    // state is active
    if (stream.match(post.pattern)) {
      state.active = false;
      return post.style;
    }

    for (let annotation of annotations) {
      if (stream.match(annotation.pattern))
        return annotation.style;
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
