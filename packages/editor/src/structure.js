import * as CodeMirror from 'codemirror';


CodeMirror.defineOption('structure', false, structure);

function structure(cm, val, old) {
  console.log('structure option', val, old);
  if (old && !old == CodeMirror.Init) {
    cleanup();
  }
  if (val) {
    cm.state.structure = new State(val);
    update(cm);
    cm.on('change', onChange);
  }
}



function cleanup() {
  delete cm.state.structure;
}

function State(options) {
  this.options = options;
}

function delay(cm, change) {
  let state = cm.state.structure;
  if (!state) return;
  clearTimeout(state.timeout);
  state.timeout = setTimeout( () => update(cm), state.options.delay || 500);
}

function update(cm) {
  let statements = findStatement(cm);
  parseStatements(cm, statements);
}


function onChange(cm, change) {
  console.log('change', change.from, change.to,' text=', change.text);

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
