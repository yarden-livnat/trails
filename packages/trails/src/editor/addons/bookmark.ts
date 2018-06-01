import * as CodeMirror from 'codemirror';
import {IStructureItem} from '../structure';

/// <reference path="../../typings/codemirror/codemirror.d.ts"/>

export
interface Bookmark extends CodeMirror.TextMarker, IStructureItem {
  _structure?: boolean;
  find(): CodeMirror.Position;
}
