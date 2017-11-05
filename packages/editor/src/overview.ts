import * as CodeMirror from 'codemirror';
import {matchDecorator} from './decorator';

CodeMirror.defineOption('overview', false, function(cm, val, old: any) {
  console.log('overview option', val, old, 'init:', (CodeMirror as any)['Init']);
  if (old /* && !old == CodeMirror.Init*/) {
    cm.state.overview = null;
  }
  if (val) {
    cm.state.overview = new State(parseOptions(val));
    update(cm);
    cm.on('change', onChange);
    cm.on('swapDoc', onChange);
  }
  // cm.on('markerAdded', () => { console.log('markerAdded');});
  // cm.on('change', () => { console.log('change');})
});

function State(options) {
  this.options = options;
  this.bookmarks = new Map();
}

function parseOptions(options) {
  return options;
}

function update(cm): void {
    let state = cm.state.overview;
    if (!state) return;
    cm.operation( () => updateOverview(cm));
}

function onChange(cm) {
  let state = cm.state.overview;
  if (!state) return;
  let opt = state.options;
  clearTimeout(state.changeUpdate);
  state.changeUpdate = setTimeout( () => update(cm), opt.delay || 500);
}

function updateOverview(cm) {
  let bookmarks : Map<number, CodeMirror.TextMarker> = new Map();
  let n = 0;

  for (let l = 0, end = cm.lastLine(); l <= end; l++) {
    let line = cm.getLine(l);
    let m = matchDecorator(line);
    if (m) {
      let pos = CodeMirror.Pos(l, 3);
      let bookmark = cm.findMarksAt(pos).find( mark => mark.__isOverview);
      if (!bookmark) {
        bookmark = cm.setBookmark(pos)
        bookmark.type = m[1];
        bookmark.name = m[2];
        bookmark.__isOverview =  true;
        n++;
      }
      bookmarks.set(bookmark.id, bookmark);
    }
  }

  let prev = cm.state.overview.bookmarks;

  if (prev.size + n != bookmarks.size) {
    prev.forEach( item => bookmarks.has(item.id) || item.clear());
  }

  if (n || prev.size != bookmarks.size) {
    cm.state.overview.bookmarks = bookmarks;
    CodeMirror.signal(cm, "overview", cm, bookmarks);
  }
}
