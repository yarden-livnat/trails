import {
  Widget, PanelLayout
} from '@phosphor/widgets';

import * as d3 from 'd3';

import { Bookmark, decorators  } from '@trails/editor';

export
type Bookmark = CodeMirror.TextMarker;

type Nest = {key: string; values: any; value: any}[];

const headers = Object.keys(decorators);

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

    d3.select(this.node).selectAll('.header')
      .data(headers)
      .enter()
        .append('div')
        .attr('class', 'header')
        .text(d => d);
  }

  set bookmarks(arr: Bookmark[]) {
    this._bookmarks = this._nest.entries(arr);
    this.render();
  }

  private _bookmarks: Nest;
  private _nest : d3.Nest<Bookmark, any>;



  render() {
    let root = d3.select(this.node);
    let marks = this._bookmarks;

    root.selectAll('.header')
        .each( function(g: string) {
          let data = find(marks, g);
          let items = d3.select(this).selectAll('div')
            .data(data);
          items.enter().append('div')
            // .each( (marker: any) => {
            //     marker.on('fold', () => console.log('fold', marker.name));
            //     marker.on('unfold', () => console.log('funold', marker.name));
            //   })
            .merge(items)
            .text( (d : any)  => d.name || 'unnamed');
          items.exit().remove();
        });
  }
}
