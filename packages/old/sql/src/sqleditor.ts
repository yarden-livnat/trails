import {
  Toolbar, ToolbarButton
} from '@jupyterlab/apputils';

import {
  IChangedArgs, PathExt
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

const DIRTY_CLASS = 'jp-mod-dirty';

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

    let context = this._context = options.context;
    context.pathChanged.connect(this.onPathChanged, this)
    context.ready.then(() => { this._onContextReady(); });
    this.onPathChanged();

    this.id = 'trails-sql';
    this.title.label = 'sql';
    this.title.closable = true;

    let toolbar = this.buildToolbar();

    let editor = this._editor = new EditorWidget();
    let overview = this._overview = new Overview();

    editor.on('structure', (data:any) => overview.bookmarks(data) );
    editor.on('structure.update', () => overview.update() );


    let layout = this.layout = new PanelLayout();
    layout.addWidget(toolbar);
    layout.addWidget(overview);
    layout.addWidget(editor);

    this._onTitleChanged();
    context.pathChanged.connect(this._onTitleChanged, this);
  }

  readonly _editor: EditorWidget;
  readonly _overview: Overview;
  readonly _context: DocumentRegistry.Context;
  private _ready = new PromiseDelegate<void>();

  get context(): DocumentRegistry.Context {
    return this._context;
  }

  get ready(): Promise<void> {
    return this._ready.promise;
  }

  dispose() {
    super.dispose();
  }

  private _onTitleChanged(): void {
    this.title.label = PathExt.basename(this._context.path);
  }

  private _onContextReady():void {
    if (this.isDisposed) {
      return;
    }
    const contextModel = this._context.model;
    const editor = this._editor;

    console.log('contextModel:', contextModel);
    editor.text = contextModel.toString();

    this.onDirtyState();

    contextModel.stateChanged.connect(this.onModelStateChanged, this);
    contextModel.contentChanged.connect(this.update, this);
    this._context.fileChanged.connect(this.update, this);
    this._ready.resolve(undefined);
  }

  private onModelStateChanged(sender: DocumentRegistry.IModel, args: IChangedArgs<any>): void {
    if (args.name === 'dirty') {
      this.onDirtyState();
    }
  }

  private onDirtyState(): void {
    console.log('handleDirtyState')
    if (this._context.model.dirty) {
       this.title.className += ` ${DIRTY_CLASS}`;
    } else {
       this.title.className = this.title.className.replace(DIRTY_CLASS, '');
    }
  }

  private onContentChanged(): void {
    console.log('onContentChanged:', this._context.model.toString());
    const oldValue = this._editor.text;
    const newValue = this._context.model.toString();

    if (oldValue !== newValue) {
      this._editor.text = newValue;
    }
  }

  private onPathChanged():void {
    const path = this._context.path;
    console.log('path chagned:', path);
    // editor.model.mimeType = this._mimeTypeService.getMimeTypeByFilePath(path);
    this.title.label = PathExt.basename(path.split(':').pop()!);
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
        if (state) this._overview.hide()
        else this._overview.show();
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
        console.log('show table view');
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
