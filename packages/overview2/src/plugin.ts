
import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  IMainMenu
} from '@jupyterlab/mainmenu';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  DockLayout
} from '@phosphor/widgets';

import {
  ISQLEditorTracker
} from '@trails/sqleditor';

import {
  Overview
} from './overview';

import {
  IOverviewTracker
} from './tracker';


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

export
// const tracker: JupyterLabPlugin<IOverviewTracker> = {
const tracker: JupyterLabPlugin<void> = {
  id: '@trails/overview-extension:tracker',
  // provides: IOverviewTracker,
  requires: [ /*IMainMenu, ICommandPalette /* ILayoutRestorer/*, ISQLEditorTracker*/],
  activate: activateOverview,
  autoStart: true
};

function activateOverview(app: JupyterLab /*, mainMenu: IMainMenu, palette: ICommandPalette/*, restorer: ILayoutRestorer /*,
                          sqltracker: ISQLEditorTracker*/) { //: IOverviewTracker {
  console.log('overview plugin activated');
  const { commands, shell } = app;
  const category = 'Overview';

  // const tracker = new InstanceTracker<Overview>({ namespace: 'overview' });
  //
  // restorer.restore(tracker, {
  //   command: CommandIDs.open,
  //   args: widget => { console.log('restore: ', widget); return {
  //     path: widget.context.path,
  //     name: widget.context.path
  //   }},
  //   name: widget => widget.context.path
  // });

  // *** old
  // const widget = new Overview(sqltracker);
  // tracker.add(widget);
  //
  // restorer.add(widget, namespace);
  //
  // addCommands(app, tracker, widget);
  // shell.addToLeftArea(widget, { rank: 100 });
  //
  // app.restored.then(layout => {
  //   console.log('overview after app.restored');
  //   if (layout.fresh) {
  //     commands.execute(CommandIDs.showOverview, void 0);
  //   }
  // });

  // interface ICreateOptions extends Partial<Overview.IOptions> {
  //   ref?: string;
  //   insertMode?: DockLayout.InsertMode;
  // }
  //
  // function isEnabled(): boolean {
  //   return tracker.currentWidget !== null
  //     && tracker.currentWidget === app.shell.currentWidget;
  // }
  //
  // function createOverview(options: ICreateOptions): Overview {
  //   console.log('create overview', options);
  //   let overview = new Overview(options);
  //   tracker.add(overview);
  //
  //   // todo: connect overview to editor
  //
  //   shell.addToMainArea(overview, {ref: options.ref, mode: options.insertMode || 'tab-after'});
  //   shell.activateById(overview.id);
  //   return overview;
  // }
  //
  // // Get the current widget and activate unless the args specify otherwise.
  // function getCurrent(args: ReadonlyJSONObject): Overview | null {
  //   let widget = tracker.currentWidget;
  //   let activate = args['activate'] !== false;
  //   if (activate && widget) {
  //     shell.activateById(widget.id);
  //   }
  //   return widget;
  // }

  // commands.addCommand(CommandIDs.open, {
  //   execute: (args: Partial<Overview.IOptions>) => {
  //     let path = args['path'];
  //     let widget = tracker.find(value => value.id == path);
  //     if (widget) {
  //       shell.activateById(widget.id);
  //     }
  //   }
  // });

  // commands.addCommand(CommandIDs.create, {
  //   label: args => args['isPalette'] ? 'New Overview' : 'Overview',
  //   execute: (args: Partial<Overview.IOptions>) => {
  //     let basePath = args.basePath;
  //     return createOverview({ basePath, ...args });
  //   }
  // });
  //
  // [
  //   CommandIDs.create,
  // ].forEach(command => palette.addItem({ command, category, args: {'isPalette': true }}));
  //
  // mainMenu.fileMenu.newMenu.addGroup([{ command: CommandIDs.create }], 0);

  console.log('return tracker', tracker);
  // return tracker;
}


//
// function addCommands(app: JupyterLab, tracker: InstanceTracker<Overview>, overview: Overview): void {
//   const { commands } = app;
//
//   commands.addCommand(CommandIDs.showOverview, {
//     execute: () => { app.shell.activateById(overview.id); }
//   });
//
//   commands.addCommand(CommandIDs.hideOverview, {
//     execute: () => {
//       if (!overview.isHidden) {
//         app.shell.collapseLeft();
//       }
//     }
//   });
// }
