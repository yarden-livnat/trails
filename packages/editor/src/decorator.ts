
export
let decorators = [
  /@(block)($|\s+(\w*))/,
  /@(table)($|\s+(\w*))/,
  /@(proc|procedure)($|\s+(\w*))/
];


export
function hasDecorator(text){
  if (!text) return;
  let m;
  for (let decorator of decorators) {
    m = text.match(decorator);
    if (m) return m;
  }
}

export
function matchDecorator(text) {
  if (!text) return;
  let m;
  for (let decorator of decorators) {
    m = text.match(decorator);
    if (m) return m;
  }
}
