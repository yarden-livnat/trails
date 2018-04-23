// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

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
  // IFileMenu,
  IMainMenu,
  // IRunMenu
} from '@jupyterlab/mainmenu';


import {
  SQLEditor, SQLEditorFactory, ISQLEditorTracker
} from '@trails/sqleditor';

import {
  ILauncher
} from '@jupyterlab/launcher';


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

  export
  const markdownPreview = 'sqleditor:markdown-preview';
}


/**
 * The editor tracker extension.
 */
const plugin: JupyterLabPlugin<ISQLEditorTracker> = {
  activate,
  id: '@trails/sqleditor-extension:plugin',
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
  console.log('sqleditor activated');
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

      return commands.execute('console:create', {
        activate: args['activate'],
        path: widget.context.path,
        preferredLanguage: widget.context.model.defaultKernelLanguage,
        ref: widget.id,
        insertMode: 'split-bottom'
      });
    },
    isEnabled,
    label: 'Create Console for Editor'
  });

  commands.addCommand(CommandIDs.runCode, {
    execute: () => {
      console.log('**sql-ext.runCode');
      // Run the appropriate code, taking into account a ```fenced``` code block.
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }

      let code = '';
      const editor = widget.editor;
      const path = widget.context.path;
      const extension = PathExt.extname(path);
      const selection = editor.getSelection();
      const { start, end } = selection;
      let selected = start.column !== end.column || start.line !== end.line;

      if (selected) {
        // Get the selected code from the editor.
        const start = editor.getOffsetAt(selection.start);
        const end = editor.getOffsetAt(selection.end);

        code = editor.model.value.text.substring(start, end);
      } else if (MarkdownCodeBlocks.isMarkdown(extension)) {
        const { text } = editor.model.value;
        const blocks = MarkdownCodeBlocks.findMarkdownCodeBlocks(text);

        for (let block of blocks) {
          if (block.startLine <= start.line && start.line <= block.endLine) {
            code = block.code;
            selected = true;
            break;
          }
        }
      }

      if (!selected) {
        // no selection, submit whole line and advance
        code = editor.getLine(selection.start.line);
        const cursor = editor.getCursorPosition();
        if (cursor.line + 1 === editor.lineCount) {
          let text = editor.model.value.text;
          editor.model.value.text = text + '\n';
        }
        editor.setCursorPosition({ line: cursor.line + 1, column: cursor.column });
      }

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
    console.log('** sql-ext.createNew');
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

  // menu.fileMenu.consoleCreators.add({
  //   tracker,
  //   name: 'Editor',
  //   createConsole: current => {
  //     const options = {
  //       path: current.context.path,
  //       preferredLanguage: current.context.model.defaultKernelLanguage
  //     };
  //     return commands.execute('console:create', options);
  //   }
  // } as IFileMenu.IConsoleCreator<SQLEditor>);
  //
  // // Add a code runner to the Run menu.
  // menu.runMenu.codeRunners.add({
  //   tracker,
  //   noun: 'Code',
  //   isEnabled: current => {
  //     let found = false;
  //     consoleTracker.forEach(console => {
  //       if (console.console.session.path === current.context.path) {
  //         found = true;
  //       }
  //     });
  //     return found;
  //   },
  //   run: () => commands.execute(CommandIDs.runCode)
  // } as IRunMenu.ICodeRunner<SQLEditor>);
  //
  // app.contextMenu.addItem({
  //   command: CommandIDs.createConsole, selector: '.trails-SQLEditor'
  // });

  return tracker;
}