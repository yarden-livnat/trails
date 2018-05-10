import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
  IEditorServices
} from '@jupyterlab/codeeditor';

import {
  IConsoleTracker
} from '@jupyterlab/console';

import {
  ISettingRegistry, MarkdownCodeBlocks, PathExt
} from '@jupyterlab/coreutils';

import {
  IEditorTracker
} from '@jupyterlab/fileeditor';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
  IFileMenu,
  IMainMenu,
  IRunMenu
} from '@jupyterlab/mainmenu';

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  SQLEditor, SQLEditorFactory, ISQLEditorTracker
} from '@vatrails/sqleditor';


/**
 * The class name for the text editor icon from the default theme.
 */
const EDITOR_ICON_CLASS = 'fa fa-database sql-icon'; //'jp-TextEditorIcon';

/**
 * The name of the factory that creates editor widgets.
 */
const FACTORY = 'SQLEditor';


/**
 * The command IDs used by the sqleditor plugin.
 */
namespace CommandIDs {
  export
  const createNew = 'sqleditor:create-new';

  export
  const lineNumbers = 'sqleditor:toggle-line-numbers';

  export
  const lineWrap = 'sqleditor:toggle-line-wrap';

  export
  const changeTabs = 'sqleditor:change-tabs';

  export
  const matchBrackets = 'sqleditor:toggle-match-brackets';

  export
  const autoClosingBrackets = 'sqleditor:toggle-autoclosing-brackets';

  export
  const createConsole = 'sqleditor:create-console';

  export
  const runCode = 'sqleditor:run-code';
}


/**
 * The editor tracker extension.
 */
const plugin: JupyterLabPlugin<ISQLEditorTracker> = {
  activate,
  id: '@vatrails/sqleditor-extension:plugin',
  requires: [IConsoleTracker, IEditorServices, IFileBrowserFactory, ILayoutRestorer, ISettingRegistry, IEditorTracker],
  optional: [ICommandPalette, ILauncher, IMainMenu],
  provides: ISQLEditorTracker,
  autoStart: true
};


/**
 * Export the plugins as default.
 */
export default plugin;

  /**
 * Activate the editor tracker plugin.
 */
function activate(app: JupyterLab, consoleTracker: IConsoleTracker, editorServices: IEditorServices,
                  browserFactory: IFileBrowserFactory, restorer: ILayoutRestorer, settingRegistry: ISettingRegistry,
                  editorTracker: IEditorTracker,
                  palette: ICommandPalette, launcher: ILauncher | null, menu: IMainMenu | null): ISQLEditorTracker {
  console.log('new sql-extension activated 4');
  const id = plugin.id;
  const namespace = 'trails';


  app.docRegistry.addFileType({
    name: 'sql',
    mimeTypes: ['application/sql'],
    extensions: ['.sql'],
    iconClass: 'fa fa-database sql-icon',
    contentType: 'file',
    fileFormat: 'text'
  });

  const factory = new SQLEditorFactory({
    editorServices,
    factoryOptions: { name: FACTORY, fileTypes: ['sql'], defaultFor: ['sql'] }
  });
  const { commands, restored } = app;
  const tracker = new InstanceTracker<SQLEditor>({ namespace });
  const isEnabled = () => tracker.currentWidget !== null &&
    tracker.currentWidget === app.shell.currentWidget;

  // let config = { ...CodeEditor.defaultConfig };

  // Handle state restoration.
  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: widget => ({ path: widget.context.path, ext: 'sql', factory: FACTORY }),
    name: widget => widget.context.path
  });

  /**
   * Update the setting values.
   */

  function updateSettings(settings: ISettingRegistry.ISettings): void {
  //   let cached =
  //     settings.get('editorConfig').composite as Partial<CodeEditor.IConfig>;
  //   Object.keys(config).forEach((key: keyof CodeEditor.IConfig) => {
  //     config[key] = (cached[key] === null || cached[key] === undefined) ?
  //       CodeEditor.defaultConfig[key] : cached[key];
  //   });
  }

  /**
   * Update the settings of the current tracker instances.
   */
  function updateTracker(): void {
    tracker.forEach(widget => { updateWidget(widget); });
  }

  /**
   * Update the settings of a widget.
   */
  function updateWidget(widget: SQLEditor): void {
    // const editor = widget.editor;
    // Object.keys(config).forEach((key: keyof CodeEditor.IConfig) => {
    //   editor.setOption(key, config[key]);
    // });
  }


  // Fetch the initial state of the settings.
  Promise.all([settingRegistry.load(id), restored]).then(([settings]) => {
    updateSettings(settings);
    updateTracker();
    settings.changed.connect(() => {
      updateSettings(settings);
      updateTracker();
    });
  }).catch((reason: Error) => {
    console.error(reason.message);
    updateTracker();
  });


  factory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = EDITOR_ICON_CLASS;

    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => { tracker.save(widget); });
    tracker.add(widget);
    updateWidget(widget);
    editorTracker.inject(widget);
  });

  app.docRegistry.addWidgetFactory(factory);


  commands.addCommand(CommandIDs.createConsole, {
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }

      const path = widget.context.path;

      return commands.execute('console:create', {
        activate: args['activate'],
        path: widget.context.path,
        preferredLanguage: widget.context.model.defaultKernelLanguage,
        ref: widget.id,
        insertMode: 'split-bottom'
      }).then( con => {
        const activate = false;
        const code = '%load_ext sql';
        return commands.execute('console:inject', { activate, code, path });
      })
    },
    isEnabled,
    label: 'Create Console for SQLEditor'
  });

  commands.addCommand(CommandIDs.runCode, {
    execute: () => {
      // Run the appropriate code, taking into account a ```fenced``` code block.
      const widget = tracker.currentWidget;
      console.log('trails: runCode ');

      if (!widget) {
        return;
      }

      let code = '';
      const editor = widget.editor;
      const path = widget.context.path;
      const selection = editor.getSelection();
      const { start, end } = selection;
      let selected = start.column !== end.column || start.line !== end.line;

      if (selected) {
        // Get the selected code from the editor.
        const start = editor.getOffsetAt(selection.start);
        const end = editor.getOffsetAt(selection.end);

        code = editor.model.value.text.substring(start, end);
      } else {
        // no selection, submit whole line and advance
        code = editor.getLine(selection.start.line);
        const cursor = editor.getCursorPosition();
        if (cursor.line + 1 === editor.lineCount) {
          let text = editor.model.value.text;
          editor.model.value.text = text + '\n';
        }
        editor.setCursorPosition({ line: cursor.line + 1, column: cursor.column });
      }

      code = `%%sql \n${code}`;

      // let sql = widget.getSQLSelection();

      const activate = false;
      if (code) {
        return commands.execute('console:inject', { activate, code, path });
      } else {
        return Promise.resolve(void 0);
      }
    },
    isEnabled,
    label: 'Run Code'
  });

  // Function to create a new untitled text file, given the current working directory.
  const createNew = (cwd: string) => {
    return commands.execute('docmanager:new-untitled', {
      path: cwd, type: 'file', ext: 'sql'
    }).then(model => {
      return commands.execute('docmanager:open', {
        path: model.path, factory: FACTORY
      });
    });
  };


  // Add a command for creating a new text file.
  commands.addCommand(CommandIDs.createNew, {
    label: 'SQL File',
    caption: 'Create a new sql file',
    execute: () => {
      let cwd = browserFactory.defaultBrowser.model.path;
      return createNew(cwd);
    }
  });

  // Add a launcher item if the launcher is available.
  if (launcher) {
    launcher.add({
      displayName: 'SQL Editor',
      category: 'Other',
      rank: 1,
      iconClass: EDITOR_ICON_CLASS,
      callback: createNew
    });
  }

  menu.fileMenu.newMenu.addGroup([{ command: CommandIDs.createNew }], 30);

  menu.fileMenu.consoleCreators.add({
    tracker,
    name: 'SQLEditor',
    createConsole: current => {
      const options = {
        path: current.context.path,
        preferredLanguage: current.context.model.defaultKernelLanguage
      };
      return commands.execute(CommandIDs.createConsole, options);
    }
  } as IFileMenu.IConsoleCreator<SQLEditor>);

    menu.runMenu.codeRunners.add({
      tracker,
      noun: 'SQL',
      isEnabled: current => {
        let found = false;
        consoleTracker.forEach(console => {
          if (console.console.session.path === current.context.path) {
            found = true;
          }
        });
        return found;
      },
      run: () => commands.execute(CommandIDs.runCode)
    } as IRunMenu.ICodeRunner<SQLEditor>);

  app.contextMenu.addItem({ command: CommandIDs.createConsole, selector: '.vatrails-SQLEditor' });

  return tracker;
}
