import {
  Widget, PanelLayout
} from '@phosphor/widgets';

import * as d3 from 'd3';
import Panel from './panel';

import { Bookmark, decorators  } from '@trails/editor';

export
type Bookmark = CodeMirror.TextMarker;

type Nest = {key: string; values: any; value: any}[];

const headers = Object.keys(decorators);
let panel = Panel();

function find(a, value) {
  for (let item of a) {
    if (item.key == value)
      return item.values || [];
  }
  return [];
}

export
class Overview extends Widget {
  constructor() {
    super();
    this.addClass('trails-sql-overview');

    this._nest = d3.nest<Bookmark>()
      .key( (d: Bookmark) => d.type ).sortKeys(d3.ascending)
      .sortValues( (a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

    this._panels = headers.map(name => { return {title: name, items: []}; });

    this.render();
  }

  set bookmarks(bookmarks: Bookmark[]) {
    bookmarks.forEach( (b : any) => {
      b.on('fold', state => {b._fold = state == 'fold'; this.render();});
      b.on('clear', () => {b.off('fold'); b.off('clear'); });
    });

    let groups = this._nest.entries(bookmarks);
    for (let p of this._panels) {
      p.items = find(groups, p.title);
    }
    this.render();
  }

  private _bookmarks: Nest;
  private _nest : d3.Nest<Bookmark, any>;
  private _panels: any[];

  render() {
    d3.select(this.node)
      .call(panel, this._panels);
  }
}
