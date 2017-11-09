import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

const decorator = {token: 'decorator', pattern: /^\s*--\s+(?=@)/};
const post = {token: 'eol', pattern: /$/};

let annotations = [
  {token: 'annotation', pattern: /^@block(?=\s|$)/i},
  {token: 'annotation', pattern: /i@into(?=\s|$)/i},
  {token: 'annotation', pattern: /^@report(?=s\|$)/i},
  {token: 'annotation', pattern: /^@info(?=\s|$)/i},
  {token: 'annotation', pattern: /^@debug(?=s\|$)/i},
  {token: 'annotation', pattern: /^@use(?=\s|$)/i},
  {token: 'annotation', pattern: /^@proc|@procedure|@function(?= |$)/i},
  {token: 'unknown',    pattern: /^@\w*/},
  {token: 'identifier', pattern: /\S+/},
  {token: 'text',       pattern: /\S+/}
];

let keywords = [
  {token: 'keyword', pattern: /^GO/i},
  {token: 'eos', pattern: /^;/}
];

// let keys = Object.keys(annotations);

CodeMirror.defineMode("trails-sql", function(config :any, parserConfig) {
  let mode = 'text/x-' + config.dialect || 'mssql'
  let sql = CodeMirror.getMode(config, {
    name: mode
  });

  function lex(stream, state) {
    if (stream.eatSpace()) return null;

    for (let annotation of annotations) {
      if (stream.match(annotation.pattern))
        return annotation.token;
    }

    return 'error'; // non-reachable
  }

  function parser_trails(stream, state ) {
    let cx = state.context;
    let prev = cx.token;

    let style = lex(stream, state);
    if (!style) return;

    if (style == 'eol') {
      state.pop();
      return style;
    }

    if (prev == decorator.token) {
      if (style != 'annotation') return error(style, stream, state);
      cx.token = style;
      return style;
    }

    if (prev == 'annotation') {
      if (style == 'identifier') {
        cx.token = style;
        return style;
      }
    }

    // after name or missing or non-valid name
    stream.skipToEnd();
    return 'desc';
  }

  function parser(stream: any, state: any) {
    if (state.context && state.context.trails) {
      let style = parser_trails(stream, state);
      if (stream.eol()) pop(state);
      return style;
    }

    if (stream.sol()) {
      if (stream.match(decorator.pattern)) {
        push(stream, state);
        return `${decorator.token} line-background-decorator`;
      }
    }

    return sql.token(stream, state);
  }

  function error(style, stream, state) {
    stream.skipToEnd();
    state.context.token = 'error';
    return style + ' error'
  }

  function push(stream, state) {
    state.context = {
      prev: state.context,
      indent: stream.indentation(),
      col: stream.column(),
      trails: true,
      token: decorator.token
    };
  }

  function pop(state) {
    state.indent = state.context.index;
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
