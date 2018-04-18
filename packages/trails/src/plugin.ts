import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  Dialog, ICommandPalette, showDialog
} from '@jupyterlab/apputils';

import {
    IMainMenu
} from '@jupyterlab/mainmenu';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  ServiceManager, Kernel
} from '@jupyterlab/services';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  Menu
} from '@phosphor/widgets';

import {
  ITrails, Trails
} from './trails';



namespace CommandIDs {
  export
  const editor = 'trails:editor';

  export
  const notebook = 'trails:notebook';
}

export
interface ITrailsNotebookMonitor extends DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
}

class TrailsNotebookMonitor implements ITrailsNotebookMonitor {
  constructor(trails: Trails) {
    this._trails = trails;
  }

  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let client: Trails.IClient = {
      type: 'notebook',
      changeKernel(options: Kernel.IModel) {
        nb.session.changeKernel(options);
      }
    };
    this._trails.register(client);
    return new DisposableDelegate( () => this._trails.unregister(client) );
  }

  private _trails: Trails;
}

export
const trails: JupyterLabPlugin<ITrails> = {
  activate: activateTrails,
  id: '@trails/trails-extension',
  provides: ITrails,
  requires: [ IMainMenu, ICommandPalette],
  autoStart: true
};

function activateTrails(app: JupyterLab, mainMenu: IMainMenu, palette: ICommandPalette): ITrails {
  const services = app.serviceManager;
  const { commands } = app;

  // addCommands(app, services);
  // populatePalette(paletter);
  //
  // createMenu(app, mainMenu);

  let trails = new Trails({manager: services});
  app.docRegistry.addWidgetExtension('Notebook', new TrailsNotebookMonitor(trails));

  return trails;
}

function addCommands(app: JupyterLab, services: ServiceManager): void {
  const { commands, shell } = app;

  // commands.addCommand(CommandIDs.editor, {
  //   label: 'SQL Editor',
  //   execute: args => {
  //
  //   },
  //   isEnabled: true
  // });
}

function populatePalette(palette: ICommandPalette): void {
  let category = 'Trails';

  [
    CommandIDs.editor,
    CommandIDs.notebook
  ].forEach( command => palette.addItem({command, category}));
}

function createMenu(app: JupyterLab, mainMenu: IMainMenu): void {
  let { commands } = app;
  let menu = new Menu({ commands });

  menu.title.label = 'Trails';

  menu.addItem({ command: CommandIDs.editor });
  menu.addItem({ command: CommandIDs.notebook });

  mainMenu.addMenu(menu, { rank: 10 });
}
