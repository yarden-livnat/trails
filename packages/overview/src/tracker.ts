import {IInstanceTracker} from '@jupyterlab/apputils';
import {Token} from '@phosphor/coreutils';

import {Overview} from './overview';


/* tslint:disable */
/**
 * The overview tracker token.
 */
export
const IOverviewTracker = new Token<IOverviewTracker>('@trails/overview:IOverviewTracker');
/* tslint:enable */

/**
 * A class that tracks editor widgets.
 */
export
interface IOverviewTracker extends IInstanceTracker<Overview> {}



