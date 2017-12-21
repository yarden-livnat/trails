import * as CodeMirror from 'codemirror';

export
interface Bookmark extends CodeMirror.TextMarker {
  type: string,
  name?: string,
  offset: number,
  _structure?: boolean,
  _fold?: boolean,
  _fold_explicit?: boolean
}
