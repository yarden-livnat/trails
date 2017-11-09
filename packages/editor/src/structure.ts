import * as CodeMirror from 'codemirror';
import {Bookmark} from './bookmark';
import {decorators} from './mode';

let Init = (CodeMirror as any)['Init'];


CodeMirror.defineOption('structure', false, structure);

function structure(cm, val, old) {
  console.log('structure option', val, old);
  if (old && !old == Init) {
    cleanup(cm);
  }
  if (val) {
    cm.state.structure = new State(val);
    update(cm);
    cm.on('change', onChange);
    cm.on('swapDoc', onChange);
    cm.on('fold', (cm, from, to) => onFold(cm, from, 'fold'));
    cm.on('unfold', (cm, from, to) => onFold(cm, from, 'unfold'));
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
  console.log('change', change.from, change.to,' text=', change.text);
  let state = cm.state.structure;
  if (!state) return;
  let opt = state.options;
  clearTimeout(state.timeout);
  state.timeout = setTimeout( () => update(cm), opt.delay || 500);
}

function onFold(cm, from, type) {
  console.log(type, from);
  for (let mark of cm.findMarksAt({line: from.line, ch: 3})) {
    if (mark.__isOverview) {
      CodeMirror.signal(mark, 'fold', type);
    }
  }
}

function update(cm) {
  if (!cm.state.structure) return;
  cm.operation( () => updateStructure(cm));
}

function updateStructure(cm) {
  updateBookmarks(cm);
  // listTokens(cm);
  // let statements = findStatement(cm);
  // parseStatements(cm, statements);
}

function Pos(l,c) {
  return CodeMirror.Pos(l,c);
}

function find(tokens, type) {
  let token, done;
  while (([token, done] = tokens.next())) {
    if (done) return null;
    if (token.type == type) return token;
  }
}

function updateBookmarks(cm) {
  let bookmarks : Map<number, Bookmark> = new Map();
  let n = 0, update = false;

  for (let line=0, last = cm.lastLine(); line <= last; line++) {
    let token, tokens = cm.getLineTokens(line);
    let t = 0, n = tokens.length;

    while (++t < n && (token = tokens[t]).type != 'annotation');
    if (t >= n) continue;

    let pos = Pos(line, token.start);
    let bookmark = cm.findMarksAt(pos).find( mark => mark.__structure);
    if (!bookmark) {
      bookmark = cm.setBookmark(pos) as Bookmark;
      bookmark._structure = true;
    }
    let type = decorators.get(token.string.toLowerCase());
    if (bookmark.type != type) { bookmark.type = type; update = true;}
    bookmark.offset = token.start;

    while (++t < n && (token = tokens[t]).type != 'identifier');
    let name = t < n && token.string || null;
    if (bookmark.name != name) { bookmark.name = name; update = true}

    bookmarks.set(bookmark.id, bookmark);
  }
  let prev = cm.state.structure.bookmarks;

  if (prev.size + n != bookmarks.size) {
    prev.forEach( item => bookmarks.has(item.id) || item.clear());
  }

  if (update || n || prev.size != bookmarks.size) {
    cm.state.structure.bookmarks = bookmarks;
    CodeMirror.signal(cm, "structure", cm, Array.from(bookmarks.values()));
  }
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
