import * as CodeMirror from 'codemirror';
import {Bookmark} from './bookmark';
import {decorators} from './mode';

let Init = (CodeMirror as any)['Init'];


CodeMirror.defineOption('structure', false, structure);

function structure(cm, val, old) {
  if (old && !old == Init) {
    cleanup(cm);
  }
  if (val) {
    cm.state.structure = new State(val);
    update(cm);
    cm.on('change', onChange);
    cm.on('swapDoc', onChange);
    cm.on('fold', (cm, from, to) => onFold(cm, from, to, 'fold'));
    cm.on('unfold', (cm, from, to) => onFold(cm, from, to, 'unfold'));
  }
}

function cleanup(cm) {
  delete cm.state.structure;
}

function State(options) {
  this.options = options;
  this.bookmarks = new Map();
}

function onChange(cm, change) {
  let state = cm.state.structure;
  if (!state) return;
  let opt = state.options;
  clearTimeout(state.timeout);
  state.timeout = setTimeout( () => update(cm), opt.delay || 500);
}

function onFold(cm, from, to, type) {
  let report = false;
  let fold = type == 'fold';
  let bookmark = cm.findMarks(Pos(from.line,0), Pos(from.line+1, 0)).find( mark => mark._structure);
  if (bookmark) {
    bookmark._fold = fold;
    bookmark._fold_explicit = fold;
    report = true;
  }
  for (let mark of cm.findMarks(Pos(from.line+1, 0), to)) {
    if (mark._structure && !mark._fold_explicit ) {
      mark._fold = fold;
      report = true;
    }
  };
  if (report) CodeMirror.signal(cm, 'structure.update');
}

function update( cm, change = null) {
  if (!cm.state.structure) return;
  let from = change && change.from || Pos(0, 0);
  let to = change && change.to || Pos(cm.lastLine(), cm.getLine(cm.lastLine()).length-1);
  cm.operation(() => updateStructure(cm, from, to));
}


function updateStructure(cm, from, to) {
  updateBookmarks(cm, from, to);
  // listTokens(cm);
  // let statements = findStatement(cm);
  // parseStatements(cm, statements);
}

function Pos(l,c) {
  return CodeMirror.Pos(l,c);
}

function findAnnotation(cm, line) {
  let tokens = cm.getLineTokens(line);
  let t = 0, n = tokens.length;
  let annotation, name;

  while (++t < n && (annotation = tokens[t]).type != 'annotation');
  if (t >= n) return null;
  while (++t < n && (name = tokens[t]).type != 'identifier');

  return {
    type: decorators.get(annotation.string.toLowerCase()),
    pos: Pos(line, annotation.start),
    name: t < n && name.string || null
  };
}

function updateBookmarks(cm, start, end) {
  let bookmark, bookmarks = [];
  for (let line=start.line; line <=end.line; line++) {
    let info = findAnnotation(cm, line);
    let from = line == start.line ? start : Pos(line, 0);
    let to = line == end.line? end : Pos(line, cm.getLine(line).length);

    if (!info) {
      bookmark = cm.findMarks(from, to).find( mark => mark._structure);
      if (bookmark) bookmark.clear();
      continue;
    }

    let update = false;
    bookmark = cm.findMarksAt(info.pos).find( mark => mark._structure);
    if (!bookmark) {
      bookmark =  cm.setBookmark(info.pos) as Bookmark;
      bookmark._structure = true;
    }
    if (bookmark.type != info.type) { bookmark.type = info.type; update = true;}
    if (bookmark.name != info.name) { bookmark.name = info.name; update = true;}

    if (update) bookmarks.push(bookmark);
  }
  if (bookmarks.length > 0) CodeMirror.signal(cm, "structure", cm, bookmarks);
}

function listTokens(cm) {
  console.log('***** tokens ****');
  for (let l=0, n=cm.lastLine(); l <= n; l++) {
    console.log('line',l);
    for (let token of cm.getLineTokens(l)) {
      console.log(token.string, token.type, token.state);
    }
  }
}

function findStatement(cm) {
  let statements = [];
  let start = CodeMirror.Pos(0, 0);
  for (let l=0, n=cm.lastLine(); l <= n; l++) {
    for (let token of cm.getLineTokens(l)) {
      if (token.type == 'semicolon') {
        let statement = {start: start, end: CodeMirror.Pos(l, token.end)};
        statements.push( statement );
        start = CodeMirror.Pos(l, token.end+1)
      }
    }
  }
  return statements;
}


function parseStatements(cm, statements) {
  for (let statement of statements) {
    let text = cm.getRange(statement.start, statement.end);
    let m = text.match(/\sinto (\#?\w+)/mi);
    if (m) {
      statement.type = 'into';
      statement.data = m[1];
    }
  }
}
