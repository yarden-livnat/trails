import * as CodeMirror from 'codemirror';

let Init = (CodeMirror as any)['Init'];
export
interface Bookmark extends CodeMirror.TextMarker {
  type: string,
  name?: string,
  __isOverview?: boolean
}

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
  console.log('*** update bookmarks');
  let bookmarks : Map<number, Bookmark> = new Map();
  let n = 0, update = false;

  for (let line=0, last = cm.lastLine(); line <= last; line++) {
    let tokens = cm.getLineTokens(line).values();

    let token = find(tokens, 'annotaton');
    if (!token) continue;

    let pos = Pos(line, token.start);
    let bookmark = cm.findMarksAt(Pos).find( mark => mark.__structure);
    if (!bookmark) {
      bookmark = cm.setBookmark(pos) as Bookmark;
      bookmark._structure = true;
    }
    if (bookmark.type != token. type) { bookmark.type = token.type; update = true;}

    token = find(tokens, 'identifier');
    let name = token && token.string || null;
    if (bookmark.name != name) { bookmark.name = name; update = true}

    bookmarks.set(bookmark.id, bookmark);
  }
  let prev = cm.state.structure.bookmarks;

  if (prev.size + n != bookmarks.size) {
    prev.forEach( item => bookmarks.has(item.id) || item.clear());
  }

  if (update || n || prev.size != bookmarks.size) {
    cm.state.structure.bookmarks = bookmarks;
    console.log('report bookmarks', bookmarks);
    CodeMirror.signal(cm, "structure", cm, Array.from(bookmarks.values()));
  }
    // let tokens = cm.getLineTokens(line);
    //
    // let t = 1, n = tokens.length;
    // while (t < n && tokens[t].type != 'annotation') t++;
    // if (t == n) continue;
    //
    // token = tokens[t];
    // let pos = Pos(line, token.start)
    // let bookmark = cm.findMarksAt(Pos).find( mark => mark.__structure);
    // if (!bookmark) {
    //   bookmark = cm.setBookmark(pos) as Bookmark;
    //   bookmark._structure = true;
    // }
    // if (bookmark.type != token.type) { bookmark.type = token.type; update = true;}
    // while (++t < n && tokens[t].type != 'identifier') t++;
    // if (t < n) {
    //   token = tokens[t];
    //   if (bookmark.name != token.string) { bookmark.name = token.string; update = true;}
    // }

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
