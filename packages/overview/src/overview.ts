import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  ISignal, Signal
} from '@phosphor/signaling';

import {
  Widget
} from '@phosphor/widgets';

import * as d3 from 'd3';
import { component } from 'd3-component';

import {
  SQLEditor, Structure, IStructureItem
} from '@trails/sqleditor';

import '../style/index.css';


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

function icon(type:string): string {
  return ICONS[type]|| ICONS['unknown'];
}

let count = 0;

export
class Overview extends Widget {
  constructor(options: Overview.IOptions) {
    super();

    this.addClass(OVERVIEW_CLASS);
    let { editor, path, name} = options;

    this.path = path;
    this.editor = editor;

    this.id = `overview-${count}`;
    this.title.icon = OVERVIEW_ICON_CLASS;
    this.title.label = PathExt.basename(path);
    this.title.closable = true;

    this.editor.structureChanged.connect(this.structureChanged, this);
    this._structure = editor.structure;

    console.log('new Overview class', this.id, path);

    d3.select(this.node)
      .append('ul')
      .attr('class', 'itemsList');

    this.render();
  }

  // readonly name:string;
  readonly path:string;
  private _structure : Structure = new Structure();
  private editor: SQLEditor;

  structureChanged(editor: SQLEditor, structure:Structure) {
    this._structure = structure;
    this.render();
  }

  render() {
      let self = this;
      let items = d3.select(this.node).select('.itemsList').selectAll('.item')
        .data(this._structure.items, (d:any) => d ? d.id : null);

      let enter = items.enter().append('div')
        .attr('class', 'item')
        .on('mouseenter', d => this.editor.highlight(d, true))
        .on('mouseleave', d => this.editor.highlight(d, false));

      enter.append('i').attr('class', 'icon')
        .attr('class', d => icon(d.type.toLowerCase()))
        .on('click', d => self.editor.fold(d));

      enter.append('div').attr('class', 'name')
        .text(d => d.name)
        .on('click', d => self.editor.revile(d));

      let merged = enter.merge(items)
        .classed('tr-overview-fold', d => d.fold)
        .classed('tr-overview-folded', d => d.folded)
        .style('padding-left', d => {
          // console.log(d.name, d.level);
          return `${(d.level-1)*20}px`;
        });

      items.exit().remove();
    }
}

export
namespace Overview {
  export
  interface IOptions {
    editor: SQLEditor,
    path?: string;
    name?: string;
  }
}
