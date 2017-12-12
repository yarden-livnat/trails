import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  Dialog, ICommandPalette, IMainMenu, showDialog
} from '@jupyterlab/apputils';



import {
  ServiceManager
} from '@jupyterlab/services';

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


const trails: JupyterLabPlugin<ITrails> = {
  activate: activateTrails,
  id: '@trails/trails-extension',
  provides: ITrails,
  requires: [
    IMainMenu,
    ICommandPalette
  ],
  autoStart: true
}

function activateTrails(app: JupyterLab, mainMenu: IMainMenu, paletter: ICommandPalette): ITrails {
  const services = app.serviceManager;
  const { commands } = app;

  // addCommands(app, services);
  // populatePalette(paletter);
  //
  // createMenu(app, mainMenu);

  return null;
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

export default  trails;
