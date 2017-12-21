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
  block: 'fa fa-square-o',
  table: 'fa fa-table',
  use: 'fa fa-database',
  report: 'fa fa-book',
  procedure: 'fa fa-code',
  unknown: 'fa fa-question'
};

function icon(type) {
  console.log('icon:', type, ICONS[type] || ICONS['unknown']);
  return ICONS[type] || ICONS['unknown'];
}

let renderItem = component('div', 'item')
  .create((s, d) => {
    s.append('i').attr('class', 'icon');
    s.append('div').attr('class', 'name');
  })
  .render( (s, d) => {
      console.log(d);
      s.classed('tr-overview-fold', d.fold)
       .classed('tr-overview-folded', d.folded)
       .style('padding-left', `${d.level*10}px`);

      s.select('i').attr('class', icon(d.type.toLowerCase()));
      s.select('.name').text(d => d.name);
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
    this._structure = widget && widget.structure || new Structure();
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
  }


  private _structure : Structure = new Structure();
  private _tracker: ISQLEditorTracker;
}
