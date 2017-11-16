import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, IInstanceTracker, InstanceTracker
} from '@jupyterlab/apputils';

import {
  Token
} from '@phosphor/coreutils';

import {
  CommandRegistry
} from '@phosphor/commands';


import {
  TestWidget, TestWidgetFactory
} from './widget';


const FILE_TYPES = [
  'sql'
];

const FACTORY_NAME = "Test";

export
interface ITestWidgetTracker extends IInstanceTracker<TestWidget> {}

export
const ITestWidgetTracker = new Token<ITestWidgetTracker>('@trails/testWidget:ITracker');

export
const plugin: JupyterLabPlugin<ITestWidgetTracker> = {
  activate,
  id: '@trails/testWidget-extension:plugin',
  provides: ITestWidgetTracker,
  requires: [ICommandPalette, ILayoutRestorer],
  autoStart: true
};

function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer): ITestWidgetTracker {
  const namespace = 'trails';
  const factory = new TestWidgetFactory({
    name: FACTORY_NAME,
    // modelName: 'base64',
    fileTypes: FILE_TYPES,
    defaultFor: FILE_TYPES
    // readOnly: true
  });
  const tracker = new InstanceTracker<TestWidget>({ namespace });

  // Handle state restoration.
  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: widget => {
      console.log('open');
      return { path: widget.context.path, factory: FACTORY_NAME }
    },
    name: widget => { console.log('name'); return widget.context.path;}
  });

  app.docRegistry.addWidgetFactory(factory);

  factory.widgetCreated.connect((sender, widget) => {
    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    tracker.add(widget);

    const types = app.docRegistry.getFileTypesForPath(widget.context.path);

    // if (types.length > 0) {
    //   widget.title.iconClass = types[0].iconClass;
    //   widget.title.iconLabel = types[0].iconLabel;
    // }
  });

  // addCommands(tracker, app.commands);

  // const category = 'Trails';

  // [CommandIDs.zoomIn, CommandIDs.zoomOut, CommandIDs.resetZoom]
  //   .forEach(command => { palette.addItem({ command, category }); });

  return tracker;
}
