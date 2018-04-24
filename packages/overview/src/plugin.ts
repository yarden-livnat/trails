import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  JSONExt // new
} from '@phosphor/coreutils';


import {
  DockLayout, Widget
} from '@phosphor/widgets';

import {
  Overview
} from './overview';


namespace CommandIDs {
  export
  const open = 'overview:open';

  export
  const create = 'overview:create';

  export
  const show = 'overview:show';

  export
  const hide = 'overview:hide';
}

/**
 * Initialization data for the jupyterlab_xkcd extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: '@trails/overview',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('overview extension activated');
  const { commands, shell } = app;
  const category = 'Overview';

  // Declare a widget variable
  // let widget: Overview;
  //
  // // Add an application command
  // app.commands.addCommand(command, {
  //   label: 'Random xkcd comic',
  //   execute: () => {
  //     if (!widget) {
  //       // Create a new widget if one does not exist
  //       widget = new Overview();
  //       widget.update();
  //     }
  //     if (!tracker.has(widget)) {
  //       // Track the state of the widget for later restoration
  //       tracker.add(widget);
  //     }
  //     if (!widget.isAttached) {
  //       // Attach the widget to the main area if it's not there
  //       app.shell.addToMainArea(widget);
  //     } else {
  //       // Refresh the comic in the widget
  //       widget.update();
  //     }
  //     // Activate the widget
  //     app.shell.activateById(widget.id);
  //   }
  // });

  // // Add the command to the palette.
  // palette.addItem({ command, category: 'Tutorial' });

  // restorer.restore(tracker, {
  //   command,
  //   args: () => JSONExt.emptyObject,
  //   name: () => 'overview'
  // });

  // Track and restore the widget state
  let tracker = new InstanceTracker<Widget>({ namespace: 'overview' });

  restorer.restore(tracker, {
      command: CommandIDs.open,
      args: widget => ({
        path: widget.path,
        name: widget.name
      }),
      name: widget => widget.name
    });

  interface ICreateOptions extends Partial<Overview.IOptions> {
    ref?: string;
    insertMode?: DockLayout.InsertMode; 
  }

  function isEnabled(): boolean {
    return tracker.currentWidget !== null
      && tracker.currentWidget === app.shell.currentWidget;
  }

  function createOverview(options: ICreateOptions): Overview {
    console.log('create overview', options);
    let overview = new Overview(options);
    tracker.add(overview);

    // todo: connect overview to editor

    shell.addToMainArea(overview, {ref: options.ref, mode: options.insertMode || 'tab-after'});
    shell.activateById(overview.id);
    return overview;
  }

  // Get the current widget and activate unless the args specify otherwise.
  function getCurrent(args: ReadonlyJSONObject): Widget { //Overview | null {
    let widget = tracker.currentWidget;
    let activate = args['activate'] !== false;
    if (activate && widget) {
      shell.activateById(widget.id);
    }
    return widget;
  }

  commands.addCommand(CommandIDs.open, {
    execute: (args: Partial<Overview.IOptions>) => {
      let path = args['path'];
      let widget = tracker.find(value => value.id == path);
      if (widget) {
        shell.activateById(widget.id);
      }
    }
  });

  commands.addCommand(CommandIDs.create, {
    label: args => args['isPalette'] ? 'New Overview' : 'Overview',
    execute: (args: Partial<Overview.IOptions>) => {
      console.log('overview.create:', args);
      let basePath = args.basePath;
      return createOverview({ basePath, ...args });
    }
  });

  [
    CommandIDs.create,
  ].forEach(command => palette.addItem({ command, category, args: {'isPalette': true }}));

  // mainMenu.fileMenu.newMenu.addGroup([{ command: CommandIDs.create }], 0)
}



export default extension;
