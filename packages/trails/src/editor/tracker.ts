import {IInstanceTracker} from "@jupyterlab/apputils";
import {Token} from "@phosphor/coreutils";

import {SQLEditor} from "./widget";


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
const ISQLEditorTracker = new Token<ISQLEditorTracker>('@vatrails/sqleditor:ISQLEditorTracker');
/* tslint:enable */
