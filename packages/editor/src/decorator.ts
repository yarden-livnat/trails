
export
let decorators = {
  block: /@(block)(?:$|\s+(\w*))/,
  table: /@(table)(?:$|\s+(\w*))/,
  procedure: /@(proc|procedure)(?:$|\s+(\w*))/
};

let patterns = Object.keys(decorators).map(key => decorators[key]);

export
function hasDecorator(text){
  if (!text) return;
  let m;
  for (let decorator of patterns) {
    m = text.match(decorator);
    if (m) return m;
  }
}

export
function matchDecorator(text) {
  if (!text) return;
  let m;
  for (let decorator of patterns) {
    m = text.match(decorator);
    if (m) return m;
  }
}
