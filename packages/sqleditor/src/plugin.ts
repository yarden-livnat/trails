// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  InstanceTracker
} from '@jupyterlab/apputils';

import {
  IEditorServices
} from '@jupyterlab/codeeditor';

import {
  ISettingRegistry, MarkdownCodeBlocks, PathExt
} from '@jupyterlab/coreutils';

import {
  IEditorTracker
} from '@jupyterlab/fileeditor';


import {
    ILauncher
} from '@jupyterlab/launcher';

import {
    SQLEditor, SQLEditorFactory,
} from './widget';

import {
    ISQLEditorTracker
} from './tracker';

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
export
const sqleditor: JupyterLabPlugin<ISQLEditorTracker> = {
  activate,
  id: '@trails/sqleditor-extension:plugin',
  requires: [ILayoutRestorer, IEditorServices, ISettingRegistry, IEditorTracker],
  optional: [ILauncher],
  provides: ISQLEditorTracker,
  autoStart: true
};


/**
 * Export the plugins as default.
 */



/**
 * Activate the editor tracker plugin.
 */
function activate(app: JupyterLab, restorer: ILayoutRestorer, editorServices: IEditorServices, settingRegistry: ISettingRegistry, editorTracker: IEditorTracker, launcher: ILauncher | null): ISQLEditorTracker {
  const namespace = 'trails';
  const factory = new SQLEditorFactory({
    editorServices,
    factoryOptions: { name: FACTORY, fileTypes: ['sql'], defaultFor: ['sql'] }
  });
  const { commands/*, restored */} = app;
  const tracker = new InstanceTracker<SQLEditor>({ namespace });
  const hasWidget = () => !!tracker.currentWidget;

  // let {
  //   lineNumbers, lineWrap, matchBrackets, autoClosingBrackets
  // } = CodeEditor.defaultConfig;

  // Handle state restoration.
  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: widget => ({ path: widget.context.path, factory: FACTORY }),
    name: widget => widget.context.path
  });

  /**
   * Update the setting values.
   */
  // function updateSettings(settings: ISettingRegistry.ISettings): void {
  //   let cached = settings.get('lineNumbers').composite as boolean | null;
  //   lineNumbers = cached === null ? lineNumbers : !!cached;
  //   cached = settings.get('matchBrackets').composite as boolean | null;
  //   matchBrackets = cached === null ? matchBrackets : !!cached;
  //   cached = settings.get('autoClosingBrackets').composite as boolean | null;
  //   autoClosingBrackets = cached === null ? autoClosingBrackets : !!cached;
  //   cached = settings.get('lineWrap').composite as boolean | null;
  //   lineWrap = cached === null ? lineWrap : !!cached;
  // }

  /**
   * Update the settings of the current tracker instances.
   */
  // function updateTracker(): void {
  //   tracker.forEach(widget => { updateWidget(widget); });
  // }
  //
  // /**
  //  * Update the settings of a widget.
  //  */
  // function updateWidget(widget: SQLEditor): void {
  //   const editor = widget.editor;
  //   editor.setOption('lineNumbers', lineNumbers);
  //   editor.setOption('lineWrap', lineWrap);
  //   editor.setOption('matchBrackets', matchBrackets);
  //   editor.setOption('autoClosingBrackets', autoClosingBrackets);
  // }

  // Fetch the initial state of the settings.
  // Promise.all([settingRegistry.load(id), restored]).then(([settings]) => {
  //   updateSettings(settings);
  //   updateTracker();
  //   settings.changed.connect(() => {
  //     updateSettings(settings);
  //     updateTracker();
  //   });
  // }).catch((reason: Error) => {
  //   console.error(reason.message);
  //   updateTracker();
  // });

  factory.widgetCreated.connect((sender, widget) => {
    widget.title.icon = EDITOR_ICON_CLASS;

    // Notify the instance tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => { tracker.save(widget); });
    tracker.add(widget);
    // updateWidget(widget);

    editorTracker.inject(widget);
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

  // Handle the settings of new widgets.
  // tracker.widgetAdded.connect((sender, widget) => {
  //   updateWidget(widget);
  // });

  // commands.addCommand(CommandIDs.lineNumbers, {
  //   execute: () => {
  //     const key = 'lineNumbers';
  //     const value = lineNumbers = !lineNumbers;
  //
  //     updateTracker();
  //     return settingRegistry.set(id, key, value).catch((reason: Error) => {
  //       console.error(`Failed to set ${id}:${key} - ${reason.message}`);
  //     });
  //   },
  //   isEnabled: hasWidget,
  //   isToggled: () => lineNumbers,
  //   label: 'Line Numbers'
  // });
  //
  // commands.addCommand(CommandIDs.lineWrap, {
  //   execute: () => {
  //     const key = 'lineWrap';
  //     const value = lineWrap = !lineWrap;
  //
  //     updateTracker();
  //     return settingRegistry.set(id, key, value).catch((reason: Error) => {
  //       console.error(`Failed to set ${id}:${key} - ${reason.message}`);
  //     });
  //   },
  //   isEnabled: hasWidget,
  //   isToggled: () => lineWrap,
  //   label: 'Word Wrap'
  // });
  //
  // commands.addCommand(CommandIDs.changeTabs, {
  //   label: args => args['name'] as string,
  //   execute: args => {
  //     let widget = tracker.currentWidget;
  //     if (!widget) {
  //       return;
  //     }
  //     let editor = widget.editor;
  //     let size = args['size'] as number || 4;
  //     let insertSpaces = !!args['insertSpaces'];
  //     editor.setOption('insertSpaces', insertSpaces);
  //     editor.setOption('tabSize', size);
  //   },
  //   isEnabled: hasWidget,
  //   isToggled: args => {
  //     let widget = tracker.currentWidget;
  //     if (!widget) {
  //       return false;
  //     }
  //     let insertSpaces = !!args['insertSpaces'];
  //     let size = args['size'] as number || 4;
  //     let editor = widget.editor;
  //     if (editor.getOption('insertSpaces') !== insertSpaces) {
  //       return false;
  //     }
  //     return editor.getOption('tabSize') === size;
  //   }
  // });
  //
  // commands.addCommand(CommandIDs.matchBrackets, {
  //   execute: () => {
  //     matchBrackets = !matchBrackets;
  //     tracker.forEach(widget => {
  //       widget.editor.setOption('matchBrackets', matchBrackets);
  //     });
  //     return settingRegistry.set(id, 'matchBrackets', matchBrackets);
  //   },
  //   label: 'Match Brackets',
  //   isEnabled: hasWidget,
  //   isToggled: () => matchBrackets
  // });
  //
  // commands.addCommand(CommandIDs.autoClosingBrackets, {
  //   execute: () => {
  //     autoClosingBrackets = !autoClosingBrackets;
  //     tracker.forEach(widget => {
  //       widget.editor.setOption('autoClosingBrackets', autoClosingBrackets);
  //     });
  //     return settingRegistry
  //       .set(id, 'autoClosingBrackets', autoClosingBrackets);
  //   },
  //   label: 'Auto-Closing Brackets',
  //   isEnabled: hasWidget,
  //   isToggled: () => autoClosingBrackets
  // });

  commands.addCommand(CommandIDs.createConsole, {
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }

      return commands.execute('console:create', {
        activate: args['activate'],
        path: widget.context.path,
        preferredLanguage: widget.context.model.defaultKernelLanguage
      });
    },
    isEnabled: hasWidget,
    label: 'Create Console for Editor'
  });

  commands.addCommand(CommandIDs.runCode, {
    execute: () => {
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
    isEnabled: hasWidget,
    label: 'Run Code'
  });

  // commands.addCommand(CommandIDs.markdownPreview, {
  //   execute: () => {
  //     let widget = tracker.currentWidget;
  //     if (!widget) {
  //       return;
  //     }
  //     let path = widget.context.path;
  //     return commands.execute('markdownviewer:open', { path });
  //   },
  //   isVisible: () => {
  //     let widget = tracker.currentWidget;
  //     return widget && PathExt.extname(widget.context.path) === '.md' || false;
  //   },
  //   label: 'Show Markdown Preview'
  // });

  // Add a launcher item if the launcher is available.
  if (launcher) {
    launcher.add({
      displayName: 'SQL Editor',
      category: 'Other',
      rank: 1,
      iconClass: EDITOR_ICON_CLASS,
      callback: cwd => {
        return commands.execute('docmanager:new-untitled', {
          path: cwd, type: 'file', ext: 'sql'
        }).then(model => {
          return commands.execute('docmanager:open', {
            path: model.path, factory: FACTORY
          });
        });
      }
    });
  }

  app.contextMenu.addItem({
    command: CommandIDs.createConsole, selector: '.trails-SQLEditor'
  });
  // app.contextMenu.addItem({
  //   command: CommandIDs.markdownPreview, selector: '.jp-FileEditor'
  // });

  return tracker;
}
