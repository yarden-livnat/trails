import {
  uuid
} from '@jupyterlab/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';


// import '../style/index.css';

let count = 0;

const OVERVIEW_CLASS = 'trails_overview';
const OVERVIEW_ICON_CLASS = 'jp-CodeConsoleIcon'; // *** todo: use own icon

export
class Overview extends Widget {
  constructor(options: Overview.IOptions) {
    super();

    this.addClass(OVERVIEW_CLASS);
    let { path, basePath, name} = options;
    this.path = path = path || `${basePath || ''}/overview-${count++}-${uuid()}`;

    this.id = `overview-${path}`;
    this.title.icon = OVERVIEW_ICON_CLASS;
    this.title.label = path;
    this.title.closable = true;

    this.name = this.id;
    console.log('new Overview class', this.id, path, basePath);

    this.img = document.createElement('img');
    this.img.className = 'jp-xkcdCartoon';
    this.node.appendChild(this.img);

    this.img.insertAdjacentHTML('afterend',
      `<div class="jp-xkcdAttribution">
        <a href="https://creativecommons.org/licenses/by-nc/2.5/" class="jp-xkcdAttribution" target="_blank">
          <img src="https://licensebuttons.net/l/by-nc/2.5/80x15.png" />
        </a>
      </div>`
    );
  }

  readonly name:string;
  readonly path:string;

  // /**
  //  * The image element associated with the widget.
  //  */
  readonly img: HTMLImageElement;
  //
  /**
   * Handle update requests for the widget.
   */
  onUpdateRequest(msg: Message): void {
    fetch('https://egszlpbmle.execute-api.us-east-1.amazonaws.com/prod').then(response => {
      return response.json();
    }).then(data => {
      this.img.src = data.img;
      this.img.alt = data.title;
      this.img.title = data.alt;
    });
  }
}

export
namespace Overview {
  export
  interface IOptions {
    path?: string;
    basePath?: string;
    name?: string;
  }
}
