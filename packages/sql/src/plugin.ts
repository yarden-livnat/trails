import {
  JupyterLabPlugin, JupyterLab, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker, IInstanceTracker
} from '@jupyterlab/apputils';

import {
  Token, JSONExt
} from '@phosphor/coreutils';

import {
  Widget
} from '@phosphor/widgets';

import {
  SQLEditor
} from './sqleditor';

import {
  SQLEditorFactory
} from './factory';

export
interface ISQLEditorTracker extends IInstanceTracker<SQLEditor> {}

export
const ISQLEditorTracker = new Token<ISQLEditorTracker>('@trails/sqleditor:tracker');


const ISQLEdiorExtension = new Token<ITrailsSQLExtension>('@trails/sqleditor:extension');

export
interface ITrailsSQLExtension {}

const FILE_TYPES = [
  'sql'
];

export
const extension: JupyterLabPlugin<ISQLEditorTracker> = {
  id: ISQLEdiorExtension.name,
  autoStart: true,
  provides: ISQLEditorTracker,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
}

const FACTORY_NAME = 'SQLEditor';

function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer): ISQLEditorTracker {
  // let widget: SQLEditor;

  const factory = new SQLEditorFactory( {
    name: FACTORY_NAME,
    fileTypes: FILE_TYPES,
    defaultFor: FILE_TYPES,
    canStartKernel: true
  });

  let tracker = new InstanceTracker<SQLEditor>({namespace: 'trails'});

  // restorer.restore(tracker, {
  //   command: 'docmanager:open',
  //   args: widget => ({ path: widget.context.path, factory: FACTORY_NAME }),
  //   name: widget => widget.context.path
  // });

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

  // addCommands(tracker, app.commands);

  // const command: string ='trails:sql';
  //
  // restorer.restore(tracker, {
  //   command,
  //   args: () => JSONExt.emptyObject,
  //   name: () => 'sql'
  // });
  //
  //
  //
  // app.commands.addCommand(command, {
  //   label: 'SQL Editor',
  //   execute: () => {
  //     if (!widget) {
  //       widget = new SQLEditor({});
  //     }
  //     if (!tracker.has(widget)) {
  //       tracker.add(widget);
  //     }
  //     if (!widget.isAttached) {
  //       app.shell.addToMainArea(widget);
  //     }
  //     app.shell.activateById(widget.id);
  //   }
  // });
  //
  // palette.addItem({command, category: 'Trails'});


  return tracker;
};
