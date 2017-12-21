import {
  Widget, PanelLayout
} from '@phosphor/widgets';

import * as d3 from 'd3';
import {component} from 'd3-component';

import {
  ISQLEditorTracker, SQLEditor, Structure, IStructureItem
} from '@trails/sqleditor';

const OVERVIEW_CLASS = 'trails_overview';

const ICONS = {
  block: 'fa fa-angle-right',
  table: 'fa fa-table',
  use: 'fa fa-database',
  report: 'fa fa-book',
  procedure: 'fa fa-code',
  unknown: 'fa fa-question'
};

function icon(type) {
  return ICONS[type] || ICONS['unknown'];
}

let renderItem = component('div', 'item')
  .create((s, d) => {
    s.append('i').attr('class', 'icon');
    s.append('div').attr('class', 'name');
    s.append('div').attr('class', 'pos');
  })
  .render( (s, d) => {
      console.log(d);
      s.classed('fold', d.fold)
       .classed('folded', d.hidden)
       .style('padding-left', `${d.level*10}px`);

      s.select('.icon').classed(icon(d.type.toLowerCase()), true);
      s.select('.name').text(d => d.name);
      s.select('.pos').text( d => d.pos);
  });

export
class Overview extends Widget {
  constructor(tracker: ISQLEditorTracker) {
    super();
    this.addClass(OVERVIEW_CLASS);

    this.id = 'overview';
    this.title.label = 'Overview';
    this._tracker = tracker;

    tracker.widgetAdded.connect(this.widgetAdded, this);
    tracker.currentChanged.connect(this.widgetChanged, this);

    d3.select(this.node)
      .append('ul')
      .attr('class', 'itemsList');
  }

  widgetAdded(tracker:ISQLEditorTracker, widget:SQLEditor) {
    widget.structureChanged.connect(this.structureChanged, this);
  }

  widgetChanged(tracker:ISQLEditorTracker, widget:SQLEditor) {
    console.log('overview: widgetChanged', widget);
    this._structure = widget && widget.structure || null;
    this.render();
  }

  structureChanged(widget:SQLEditor, structure:Structure) {
    console.log('overviw: structure', structure);
    this._structure = structure;
    this.render();
  }


  render() {
    d3.select(this.node).select('.itemsList')
      .call(renderItem, this._structure.items);

    // let items = d3.select(this.node).select('.itemsList')
    //   .selectAll('.item')
    //   .data(this._structure.items);
    //
    // items.enter().append('div')
    //   .attr('class', 'item')
    //   .merge(items)
    //   .callRenderIte
    //   .text(d => `${icon(d.type)} ${d.name} ${d.pos}`)
    //
    // items.exit().remove();
  }


  private _structure : Structure = null;
  private _tracker: ISQLEditorTracker;
}
