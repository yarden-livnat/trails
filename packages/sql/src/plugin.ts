// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';


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
  requires: [ICommandPalette, ILayoutRestorer],
  autoStart: true
};


/**
 * Export the plugin as default.
 */
export default plugin;


/**
 * Activate the Test widget extension.
 */
function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer): ISQLEditorTracker {
  const namespace = 'Trails';
  const factory = new SQLEditorFactory({
    name: FACTORY,
    fileTypes: FILE_TYPES,
    defaultFor: FILE_TYPES
  });
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
  });

  return tracker;
}
