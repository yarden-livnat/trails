// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IInstanceTracker
} from '@jupyterlab/apputils';

import {
 Token
} from '@phosphor/coreutils';

import {
  SQLEditor
} from './widget';

import '../style/index.css';

export * from './widget';
export * from './structure';


/**
 * A class that tracks editor widgets.
 */
export
interface ISQLEditorTracker extends IInstanceTracker<SQLEditor> {}


/* tslint:disable */
/**
 * The editor tracker token.
 */
export
const ISQLEditorTracker = new Token<ISQLEditorTracker>('@trails/sqleditor:ISQLEditorTracker');
/* tslint:enable */
