import {
  uuid
} from '@jupyterlab/coreutils';

import {
  Widget
} from '@phosphor/widgets';

// import * as d3 from 'd3';
// import {component} from 'd3-component';

// import {
//   SQLEditor, Structure, IStructureItem
// } from '@trails/sqleditor';

const OVERVIEW_CLASS = 'trails_overview';
const OVERVIEW_ICON_CLASS = 'jp-CodeConsoleIcon'; // *** todo: use own icon

const ICONS = {
  block: 'fa fa-square-o',
  table: 'fa fa-table',
  use: 'fa fa-database',
  report: 'fa fa-book',
  procedure: 'fa fa-code',
  unknown: 'fa fa-question'
};

let count = 0;


function icon(type) {
  return ICONS[type] || ICONS['unknown'];
}

export
class Overview extends Widget {
  constructor(options: Overview.IOptions) {
    super();

    this.addClass(OVERVIEW_CLASS);

    let { path, basePath, name} = options;
    path = path || `${basePath || ''}/overview-${count++}-${uuid()}`;

    this.id = `overview-${path}`;
    this.title.icon = OVERVIEW_ICON_CLASS;
    this.title.label = path;
    this.title.closable = true;

    console.log('new Overview class', path, basePath);
    // this._tracker = tracker;
    //
    // tracker.widgetAdded.connect(this.widgetAdded, this);
    // tracker.currentChanged.connect(this.widgetChanged, this);
    //
    // d3.select(this.node)
    //   .append('ul')
    //   .attr('class', 'itemsList');
  }

  // displose() : void {
  //   super.dispose();
  // }

  // widgetAdded(tracker:ISQLEditorTracker, widget:SQLEditor) {
  //   console.log('overview: widget added', widget.context.path);
  //   widget.structureChanged.connect(this.structureChanged, this);
  // }
  //
  // widgetChanged(tracker:ISQLEditorTracker, widget:SQLEditor) {
  //   console.log('overview: widgetChanged', widget.context.path);
  //   this._current = widget;
  //   this._structure = widget && widget.structure || new Structure();
  //   this.render();
  // }

  // structureChanged(widget:SQLEditor, structure:Structure) {
  //   // console.log('overviw: structure', widget, structure, widget == this._current);
  //   if (widget == this._current) {
  //     this._structure = structure;
  //     this.render();
  //   }
  // }
  //
  //
  // render() {
  //   let self = this;
  //   let items = d3.select(this.node).select('.itemsList').selectAll('.item')
  //     .data(this._structure.items, (d:any) => d ? d.id : null);
  //
  //   let enter = items.enter().append('div')
  //     .attr('class', 'item')
  //     .on('mouseenter', d => self.highlight(d, true))
  //     .on('mouseleave', d => self.highlight(d, false));
  //
  //   enter.append('i').attr('class', 'icon')
  //     .attr('class', d => icon(d.type.toLowerCase()))
  //     .on('click', d => self.fold(d));
  //
  //   enter.append('div').attr('class', 'name')
  //     .text(d => d.name)
  //     .on('click', d => self.select(d));
  //
  //   let merged = enter.merge(items)
  //     .classed('tr-overview-fold', d => d.fold)
  //     .classed('tr-overview-folded', d => d.folded)
  //     .style('padding-left', d => {
  //       // console.log(d.name, d.level);
  //       return `${(d.level-1)*20}px`;
  //     });
  //
  //   items.exit().remove();
  // }
  //
  //
  // highlight(item, state) {
  //   this._current.highlight(item, state);
  // }
  //
  // fold(item) {
  //   this._current.fold(item);
  // }
  //
  // select(item) {
  //   this._current.revile(item);
  // }
  //
  // private _structure : Structure = new Structure();
  // // private _tracker: ISQLEditorTracker;
  // private _current: SQLEditor = null;
}

export
namespace Overview {
  export
  interface IOptions {
    path?: string;
    basePath?: string;
    name?: string;
  }
}
