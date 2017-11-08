import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

const pre = {token: 'pre', pattern: /^\s*--\s+(?=@)/};
const post = {token: 'eol', pattern: /$/};

let annotations = [
  {token: 'block', pattern: /^@block(?=\s|$)/i},
  {token: 'into', pattern: /i@into(?=\s|$)/i},
  {token: 'report', pattern: /^@report(?=s\|$)/i},
  {token: 'info', pattern: /^@info(?=\s|$)/i},
  {token: 'debug', pattern: /^@debug(?=s\|$)/i},
  {token: 'use', pattern: /^@use(?=\s|$)/i},
  {token: 'proc', pattern: /^@proc|@procedure|@function(?= |$)/i},
  {token: 'incomplete', pattern: /^@\w*/}
];

let keywords = [
  {token: 'keyword', pattern: /^GO/i},
  {token: 'eos', pattern: /^;/}
];

let keys = Object.keys(annotations);

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function token(stream, state) {
    if (stream.eatSpace()) return null;

    for (let annotation of annotations) {
      if (stream.match(annotation.pattern))
        return 'annotation';
    }

    if (stream.match(/\S+/)) return 'word';

    stream.skipToEnd();
    return 'desc';
  }

  function parser_trails(stream, state ) {
    let cx = state.context;
    let prev = cx.token;

    if (prev == 'word') {
      stream.skipToEnd();
      return 'desc';
    }

    let style = token(stream, state);
    if (!style) return;

    if (style == 'eol') {
      state.pop();
      return style;
    }

    if (prev == 'soa') {
      if (style != 'annotation') return error(style, stream, state);
      cx.token = style;
      return style;
    }

    if (prev == 'annotation') {
      if (style == 'word') {
        cx.token = style;
        return style;
      }
      stream.skipToEnd();
      return 'desc';
    }

    console.log("bug: shouldn't get here");
  }

  function parser(stream: any, state: any) {
    if (state.context && state.context.trails) {
      let style = parser_trails(stream, state);
      if (stream.eol()) { console.log('eol');
        pop(state);
      }
      return style;
    }

    if (stream.sol()) {
      if (stream.match(pre.pattern)) {
        push(state);
        return "line-annotation";
      }
    }

    return sql.token(stream, state);
  }

  function error(style, stream, state) {
    state.error = true;
    stream.skipToEnd();
    state.context.token = 'error';
    return style + ' error'
  }

  function push(state) {
    state.context = {
      prev: state.context,
      // indent: stream.indentation(),
      // col: stream.column(),
      trails: true,
      token: 'soa'
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
      return parser(stream, state);
    },
    indent: sql.indent,
    blockCommentStart: sql.blockCommentStart,
    blockCommentEnd: sql.blockCommentEnd,
    lineComment: sql.lineComment,
    fold: 'trails',
  }
});
