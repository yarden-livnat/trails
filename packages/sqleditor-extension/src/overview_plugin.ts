import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  IMainMenu,
} from '@jupyterlab/mainmenu';

import {
  DockLayout, Widget
} from '@phosphor/widgets';

import {
  ISQLEditorTracker, SQLEditor
} from '@vatrails/sqleditor';

import {
  Overview
} from '@vatrails/overview';


namespace CommandIDs {
  export
  const open = 'overview:open';

  export
  const create = 'overview:create';

  export
  const show = 'overview:show';

  export
  const hide = 'overview:hide';

  export
  const attach = 'overview:attach';
}


const extension: JupyterLabPlugin<void> = {
  id: '@vatrails/overview',
  autoStart: true,
  requires: [IMainMenu, ICommandPalette, ILayoutRestorer, ISQLEditorTracker],
  activate: activate
};

function activate(app: JupyterLab, menu: IMainMenu , palette: ICommandPalette, restorer: ILayoutRestorer,
                  sqltracker: ISQLEditorTracker) {
  console.log('overview extension activated');
  const { commands, shell } = app;

  // Track and restore the widget state
  let tracker = new InstanceTracker<Widget>({ namespace: 'overview' });

  restorer.restore(tracker, {
      command: CommandIDs.create,
      args: widget => ({
        path: widget.path,
        name: PathExt.basename(widget.path)
      }),
      name: widget => widget.path
    });

  interface ICreateOptions extends Partial<Overview.IOptions> {
    ref?: string;
    insertMode?: DockLayout.InsertMode; 
  }

  function createOverview(options: ICreateOptions, editor: SQLEditor): Overview {
    let {path} = options;
    let overview = new Overview({editor, path} );

    tracker.add(overview);

    // todo: connect overview to editor

    shell.addToMainArea(overview, {ref: options.ref, mode: options.insertMode || 'tab-after'});
    shell.activateById(overview.id);
    return overview;
  }


  const isEnabled = () => sqltracker.currentWidget !== null &&
    sqltracker.currentWidget === app.shell.currentWidget;

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
    label: args => 'Overview',
    execute: (args: Partial<Overview.IOptions>) => {
      console.log('create', args);
      let {path, name} = args;
      let editor = null;
      sqltracker.forEach( widget => {
          if (widget.context.path == path) {
            editor = widget;
          }
        });
      if (!editor) {
        console.log(`overview: can't find editor  (${path} to attach to.`);
        return null;
      } else {
        return createOverview(args, editor);
      }

    }
  });

  commands.addCommand(CommandIDs.attach, {
    label: 'New SQL Overview ',
    caption: 'Attach an Overview to current SQLEditor',
    execute: args => {
      console.log('attach to', args);
      const editor = sqltracker.currentWidget;
      if (!editor) return;

      return createOverview({
        path: editor.context.path,
        ref: editor.id,
        insertMode: 'split-top'
      }, editor);
    },
    isEnabled
  });

  menu.fileMenu.addGroup([{ command: CommandIDs.attach }], 100);

  app.contextMenu.addItem( {
    command: CommandIDs.attach,
    selector: '.vatrails-SQLEditor',
    rank: 0
  })
}



export default extension;
