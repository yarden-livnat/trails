import {
  JupyterLabPlugin, JupyterLab, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  Token, JSONExt
} from '@phosphor/coreutils';

import {
  Widget
} from '@phosphor/widgets';

import {
  TrailsSQL
} from './widget';

export
const ITrailsSQLExtension = new Token<ITrailsSQLExtension>('trails.extension.sql');

export
interface ITrailsSQLExtension {}

function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
  let widget: TrailsSQL;

  const command: string ='trails:sql';
  app.commands.addCommand(command, {
    label: 'Trails SQL',
    execute: () => {
      if (!widget) {
        widget = new TrailsSQL();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      }
      app.shell.activateById(widget.id);
    }
  });

  palette.addItem({command, category: 'Trails'});

  let tracker = new InstanceTracker<Widget>({namespace: 'trails'});
  restorer.restore(tracker, {
    command,
    args: () => JSONExt.emptyObject,
    name: () => 'xkcd'
  });
};

export
const extension: JupyterLabPlugin<void> = {
  id: 'trails.extension.sql',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
}
