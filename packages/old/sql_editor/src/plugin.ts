import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  CodeEditor, IEditorServices
} from '@jupyterlab/codeeditor';

import {
  Kernel
} from '@jupyterlab/services';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils'

import {
  ITrails, Trails
} from '@trails/trails';

import {
  SQLEditor
} from './sqleditor';

import {
  SQLEditorFactory
} from './factory';

import {
  ISQLEditorTracker
} from './tracker';


const FILE_TYPES = [
  'sql'
]

const FACTORY = 'SQLEDITOR';

/**
 * The SQLEditor file handler extension.
 */
const plugin: JupyterLabPlugin<ISQLEditorTracker> = {
  activate,
  id: '@trails/sqleditor:plugin',
  provides: ISQLEditorTracker,
  requires: [ICommandPalette, ILayoutRestorer, IEditorServices, ITrails],
  autoStart: true
};


export default plugin;


/**
 * Activate the Test widget extension.
 */
function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer, editorServices: IEditorServices, trails:ITrails): ISQLEditorTracker {
  const id = plugin.id;
  const namespace = 'Trails';
  const factory = new SQLEditorFactory({
    editorServices,
    factoryOptions: { name: FACTORY, fileTypes: FILE_TYPES, defaultFor: FILE_TYPES}
  });
  const {commands, shell} = app;
  const tracker = new InstanceTracker<SQLEditor>({ namespace });

  // Handle state restoration.
  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: widget => ({ path: widget.context.path, factory: FACTORY }),
    name: widget => widget.context.path
  });

  app.docRegistry.addFileType({
    name: 'sql',
    mimeTypes: ['application/sql'],
    extensions: ['.sql'],
    iconClass: 'fa fa-database sql-icon',
    contentType: 'file',
    fileFormat: 'text'
  });

  app.docRegistry.addWidgetFactory(factory);

  factory.widgetCreated.connect((sender, widget) => {
    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => { tracker.save(widget); });
    tracker.add(widget);

    const types = app.docRegistry.getFileTypesForPath(widget.context.path);

    if (types.length > 0) {
      widget.title.iconClass = types[0].iconClass;
      widget.title.iconLabel = types[0].iconLabel;
    }

    let client: Trails.IClient = {
      type: 'TrailsEditor',
      changeKernel(options: Kernel.IModel): void {
        let editor:SQLEditor = widget as SQLEditor;
        editor.session.changeKernel(options);
      }
    }
    trails.register(client);

  });

  let command = "trails:sql-editor";
  app.commands.addCommand(command, {
    label: "SQL Editor",
    execute: () => commands.execute('docmanager:new-untitled', {
        path: '.', type: 'file', ext: 'sql', format: 'text'
      })
      .then(model => commands.execute('docmanager:open', {
          path: model.path, factory: FACTORY
      }))
  });

  palette.addItem({command, category: "Trails"});

  return tracker;
}
