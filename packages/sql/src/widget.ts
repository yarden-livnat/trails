
import {
  Widget, PanelLayout, SplitPanel
} from '@phosphor/widgets';

import {
  SQLEditor
} from './editor';


import {
  Overview
} from './overview';

import * as d3 from 'd3';


export
class TrailsSQL extends Widget {
  constructor() {
    super();

    this.id = 'trails-sql';
    this.title.label = 'sql';;
    this.title.closable = true;
    this.addClass('trails-sql');

    this.editor = new SQLEditor();
    let overview = this.overview = new Overview();

    this.editor.on('structure', (data:any) => overview.bookmarks = data );


    let panel = this.panel = new SplitPanel();
    panel.orientation = 'vertical';
    panel.addWidget(this.overview);
    panel.addWidget(this.editor);

    let layout = this.layout = new PanelLayout();
    layout.addWidget(panel);
  }

  readonly editor: SQLEditor;
  readonly overview: Overview;
  readonly panel: SplitPanel;
}
