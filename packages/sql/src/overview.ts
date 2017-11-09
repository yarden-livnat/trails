import {
  Widget, PanelLayout
} from '@phosphor/widgets';

import * as d3 from 'd3';
import Panel from './panel';

import { Bookmark, DECORATORS_NAMES  } from '@trails/editor';

export
type Bookmark = CodeMirror.TextMarker;

type Nest = {key: string; values: any; value: any}[];

let panelRenderer = Panel();

interface IPanel {
  title: string,
  items: Bookmark[];
}

export
class Overview extends Widget {
  constructor() {
    super();
    this.addClass('trails-sql-overview');

    this.panels = DECORATORS_NAMES.map( name => ({title: name, items: []}));

    this.render();
  }

  update() {
    this.render();
  }

  bookmarks(bookmarks: Bookmark[]) {
    for (let bookmark of bookmarks) {
      let panel = this.panels.find( p => p.title == bookmark.type );
      let item = panel.items.find( item => item == bookmark);

      if (!item) {
        panel.items.push(bookmark);
        bookmark.on('clear', () => {
          bookmark.off('fold'); bookmark.off('clear');
          panel.items.splice( panel.items.findIndex( b => b == bookmark), 1);
          this.render();
        });
      }
    }
    this.render();
  }

  private panels: IPanel[];

  render() {
    d3.select(this.node)
      .call(panelRenderer, this.panels);
  }
}
