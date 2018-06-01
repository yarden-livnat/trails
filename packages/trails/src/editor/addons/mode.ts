import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';

/// <reference path="../../../typings/codemirror/codemirror.d.ts"/>

const decorator = {token: 'decorator', pattern: /^\s*--\s+(?=@)/};

let annotations = [
  {token: 'annotation', name: 'Block', pattern: /^@block(?=\s|$)/i},
  {token: 'annotation', name: 'Table', pattern: /@table(?=\s|$)/i},
  {token: 'annotation', name: 'Report', pattern: /^@report(?=s\|$)/i},
  {token: 'annotation', pattern: /^@info(?=\s|$)/i},
  {token: 'annotation', pattern: /^@debug(?=s\|$)/i},
  {token: 'annotation', name: 'Use', pattern: /^@use(?=\s|$)/i},
  {token: 'annotation', name: 'Procdeure', pattern: /^@procedure|@function(?= |$)/i},
  {token: 'unknown',    pattern: /^@\w*/},
  {token: 'identifier', pattern: /\S+/},
  {token: 'text',       pattern: /\S+/}
];

export
let decorators = new Map(
  [['@block', 'Block'],
   ['@table', 'Table'],
   ['@report', 'Report'],
   ['@use', 'Use'],
   ['@proc', 'Procedure'],
   ['@procedure', 'Procedure'],
   ['@fucntion', 'Procedure']
 ]);

 export
 const DECORATORS_NAMES = ['Block', 'Table', 'Procdure', 'Report', 'Use'];

CodeMirror.defineMode("vatrails", function(config, parserConfig) {
  let mode = 'text/x-' + (config['dialect'] || 'mssql');
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

  function parser(stream, state) {
    if (state.context && state.context.vatrails) {
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
      vatrails: true,
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
    fold: 'vatrails',
  }
});

CodeMirror.defineMIME('text/x-vatrails', 'vatrails');

let info:any = {
  name: 'SQL_vaTrails',
  mime: 'text/x-vatrails',
  mode: 'vatrails',
  ext: ['sql'],
  file: /\.sql$/i
};
CodeMirror.modeInfo.unshift(info);
