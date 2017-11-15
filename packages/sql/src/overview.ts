import {
  Widget, PanelLayout
} from '@phosphor/widgets';

import * as d3 from 'd3';
import Renderer from './overview_renderer';

import { Bookmark, DECORATORS_NAMES  } from '@trails/editor';

export
type Bookmark = CodeMirror.TextMarker;

let panelRenderer = Renderer();

interface IPanel {
  title: string,
  items: Bookmark[];
}

const SQL_OVERVIEW_CLASS = 'sql-overview';

export
class Overview extends Widget {
  constructor() {
    super();
    this.addClass(SQL_OVERVIEW_CLASS);

    this.panels = DECORATORS_NAMES.map( name => ({title: name, items: []}));

    this.render();
  }

  update() {
    this.render();
  }

  bookmarks(bookmarks: Bookmark[]) {
    for (let panel of this.panels) {
      panel.items = [];
    }
    for (let bookmark of bookmarks) {
      let panel = this.panels.find( p => p.title == bookmark.type );
      panel.items.push(bookmark);
    }
    this.render();
  }

  private panels: IPanel[];

  render() {
    d3.select(this.node)
      .call(panelRenderer, this.panels);
  }
}
