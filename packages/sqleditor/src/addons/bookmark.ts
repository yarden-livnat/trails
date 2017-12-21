import * as CodeMirror from 'codemirror';
import {IStructureItem} from '../structure';

export
interface Bookmark extends CodeMirror.TextMarker, IStructureItem {
  _structure?: boolean
}
