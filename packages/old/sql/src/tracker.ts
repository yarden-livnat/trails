import {
  IInstanceTracker
} from '@jupyterlab/apputils';

import {
  Token
} from '@phosphor/coreutils';

import {
  SQLEditor
} from './sqleditor';

export
interface ISQLEditorTracker extends IInstanceTracker<SQLEditor> {}

export
const ISQLEditorTracker = new Token<ISQLEditorTracker>('@trails/sqleditor:tracker');
