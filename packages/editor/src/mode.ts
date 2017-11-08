import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

const pre = {style: 'pre-block', pattern: /--\s+(?=@)/};
const post = {style: 'post-block', pattern: /$/};

let annotations = [
  {style: 'annotation block', pattern: /^@block(?=\s|$)/},
  {style: 'annotation', pattern: /@into(?=\s|$)/},
  {style: 'annotation', pattern: /^@report(?=s\|$)/},
  {style: 'annotation', pattern: /^@info(?=\s|$)/},
  {style: 'annotation', pattern: /^@debug(?=s\|$)/},
  {style: 'annotation', pattern: /^@use(?=\s|$)/},
  {style: 'annotation', pattern: /^@proc|@procedure|@function(?= |$)/},
];

let keywords = [
  {style: 'keyword', pattern: /^GO/i},
  {style: 'eos', pattern: /^;/}
];

let keys = Object.keys(annotations);

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function trails(stream: any, state: any) {
    // console.log('peek:', stream.pos, stream.peek());
    if (state.context && state.context.trails) {
      if (stream.eatSpace()) return null;
      let type = state.context.type;
      let m;

      if (type == 'pre') {
        for (let annotation of annotations) {
          if (stream.match(annotation.pattern)) {
            state.type = 'annotation';
            return annotation.style;
          }
        }
        if (stream.eatWhile(/\w/)) {
          state.type = 'annotation';
          return 'word';
        }
        
      }
      if (type == 'annotation') {
        if ((m = stream.match(/\w+/))) {
          state.type = 'name';
          return 'name';
        }
      }
      if (type == 'name') {
        stream.skipToEnd();
        return 'desc';
      }

      if (stream.match(post.pattern)) {
        console.log('eol');
        pop(state);
        return post.style;
      }
    }
    if (stream.match(pre.pattern)) {
      push(state);
      return pre.style;
    }

    return null;
  }

  function push(state) {
    state.context = {
      prev: state.context,
      // indent: stream.indentation(),
      // col: stream.column(),
      trails: true,
      type: 'pre'
    };
  }

  function pop(state) {
    state.context = state.context.prev;
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
