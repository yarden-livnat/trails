import * as CodeMirror from 'codemirror';

export 
interface Bookmark extends CodeMirror.TextMarker {
  type: string,
  name?: string,
  offset: number,
  __isOverview?: boolean
}
