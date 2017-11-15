import {
  Toolbar, ToolbarButton
} from '@jupyterlab/apputils';

import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  PromiseDelegate
} from '@phosphor/coreutils';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  Widget, PanelLayout, SplitPanel
} from '@phosphor/widgets';

import {
  EditorWidget
} from './editor';


import {
  Overview
} from './overview';

import * as d3 from 'd3';


const SQL_PANEL_CLASS = 'sql-panel';
const SQL_PANEL_TOOLBAR_CLASS = 'sql-panel-toolbar';

const TOOLBAR_SAVE_CLASS = 'jp-SaveIcon';
const TOOLBAR_OVERVIEW_CLASS = 'fa fa-list-ul sql-overview-button';
const TOOLBAR_TABLE_CLASS = 'fa fa-table sql-table-button';

export
class SQLEditor extends Widget implements DocumentRegistry.IReadyWidget, IDisposable  {
  constructor(options: SQLEditor.IOptions) {
    super();
    this.addClass(SQL_PANEL_CLASS);

    let context = this.context = options.context;

    this.id = 'trails-sql';
    this.title.label = 'sql';;
    this.title.closable = true;

    let toolbar = this.buildToolbar();

    let editor = this.editor = new EditorWidget();
    let overview = this.overview = new Overview();

    editor.on('structure', (data:any) => overview.bookmarks(data) );
    editor.on('structure.update', () => overview.update() );


    let layout = this.layout = new PanelLayout();
    layout.addWidget(toolbar);
    layout.addWidget(overview);
    layout.addWidget(editor);

    this._onTitleChanged();
    context.pathChanged.connect(this._onTitleChanged, this);

    context.ready.then(() => {
      if (this.isDisposed) {
        return;
      }
      // this._render();
      context.model.contentChanged.connect(this.update, this);
      context.fileChanged.connect(this.update, this);
      this._ready.resolve(void 0);
    });
  }

  readonly editor: EditorWidget;
  readonly overview: Overview;
  readonly context: DocumentRegistry.Context;
  private _ready = new PromiseDelegate<void>();

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  dispose() {
    super.dispose();
  }
  
  private _onTitleChanged(): void {
    this.title.label = PathExt.basename(this.context.path);
  }

  private buildToolbar() {
    let toolbar = new Toolbar();
    toolbar.addClass(SQL_PANEL_TOOLBAR_CLASS);

    toolbar.addItem('overview', this.createOverviewButton());
    toolbar.addItem('table', this.createTableButton());
    toolbar.addItem('save', this.createSaveButton());

    return toolbar;
  }

  private createOverviewButton(): ToolbarToggleButton {
    return new ToolbarToggleButton({
      className: TOOLBAR_OVERVIEW_CLASS,
      onToggle: (state) => {
        console.log('flip overview', state);
        if (state) this.overview.hide()
        else this.overview.show();
      }
    });
  }

  private createSaveButton(): ToolbarButton {
    return new ToolbarButton({
      className: TOOLBAR_SAVE_CLASS,
      onClick: () => {
        console.log('save file');
      }
    });
  }

  private createTableButton(): ToolbarToggleButton {
    return new ToolbarToggleButton({
      className: TOOLBAR_TABLE_CLASS,
      onToggle: (state) => {
        console.log('shoe table view');
      }
    });
  }
}


export
class ToolbarToggleButton extends ToolbarButton {
  constructor(options) {
    super({
      ...options,
      onClick: () => {
        console.log('toggle');
        this.toggle();
      }
    });
    this._toggle = options.onToggle || ((boolean) => {});
  }

  toggle() {
    this._armed = !this._armed;
    this._toggle(this._armed);
  }

  get armed(): boolean {
    return this._armed;
  }

  private _armed: boolean = false;
  private _toggle: (booglen) => void;
}

export
namespace SQLEditor {
  export interface IOptions {
      context: DocumentRegistry.Context;
  }
}
