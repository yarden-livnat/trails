
import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  InstanceTracker, ToolbarButton
} from '@jupyterlab/apputils';

import {
  ISQLEditorTracker
} from '@trails/sqleditor';

import {
  Overview
} from './overview';

const namespace = 'overview';

namespace CommandIDs {
  export
  const showOverview = 'overview:show';

  export
  const hideOverview = 'overview:hide';
}

export
const overview: JupyterLabPlugin<void> = {
  activate: activateOverview,
  id: '@trails/overview',
  requires: [ILayoutRestorer, ISQLEditorTracker],
  autoStart: true
};

function activateOverview(app: JupyterLab, restorer: ILayoutRestorer, sqltracker: ISQLEditorTracker): void {
  const { commands, shell } = app;

  const tracker = new InstanceTracker<Overview>({ namespace });
  const widget = new Overview(sqltracker);

  tracker.add(widget);

  restorer.add(widget, namespace);

  addCommands(app, tracker, widget);
  shell.addToLeftArea(widget, { rank: 100 });

  app.restored.then(layout => {
    if (layout.fresh) {
      commands.execute(CommandIDs.showOverview, void 0);
    }
  });

}

function addCommands(app: JupyterLab, tracker: InstanceTracker<Overview>, overview: Overview): void {
  const { commands } = app;

  commands.addCommand(CommandIDs.showOverview, {
    execute: () => { app.shell.activateById(overview.id); }
  });

  commands.addCommand(CommandIDs.hideOverview, {
    execute: () => {
      if (!overview.isHidden) {
        app.shell.collapseLeft();
      }
    }
  });
}
