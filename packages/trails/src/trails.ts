
import {
  ClientSession, IClientSession
} from '@jupyterlab/apputils';

import {
  NotebookPanel
} from '@jupyterlab/notebook';

import {
  Token
} from '@phosphor/coreutils';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  ServiceManager, Kernel
} from '@jupyterlab/services';

export
const ITrails = new Token<ITrails>('@trails/trails');

export
interface ITrails {
  register(client: Trails.IClient): void;
  unregister(client: Trails.IClient): void;
}

export
class Trails implements ITrails {
  constructor(options: Trails.IOptions) {
    let session = this._session = new ClientSession({
      manager: options.manager.sessions,
      path:'trails',
      name: 'Trails',
      type: 'trails',
      kernelPreference: {
        name: 'python3',
        language: 'python',
        shouldStart: true,
        canStart: true
      }
    });
    console.log('trails session ', session);
    session.ready.then(()  =>
      console.log('*** session ready', session)
    ).catch((e) =>
      console.log('*** session error', e, session)
    );

    session.kernelChanged.connect(this._update, this);
    session.propertyChanged.connect(this._update, this);

    session.initialize();
  }

  register(client: Trails.IClient ): void {
    console.log('Trails:register ', client);
    this._clients.add(client);
    this._session.ready.then( () =>
      client.changeKernel({ id: this._session.kernel.id, name: this._session.kernel.name })
    );
  }

  unregister(client: Trails.IClient): void {
    console.log('Trails:unregister', client);
    this._clients.delete(client);
  }

  private _update(): void {
    console.log('trails updated');
  }

  private _session: IClientSession;
  private _notebooks: Set<NotebookPanel> = new Set();
  private _clients: Set<Trails.IClient> = new Set();
}


export
namespace Trails {
  export
  interface IOptions {
    manager: ServiceManager.IManager;
  }

  export
  interface IClient {
    readonly type: string,
    // name(): string,
    changeKernel(options: Kernel.IModel): void
  }
}
