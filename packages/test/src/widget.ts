import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  PromiseDelegate
} from '@phosphor/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';

const TEST_CLASS = 'test';

export
class TestWidget extends Widget implements DocumentRegistry.IReadyWidget {
  constructor(context: DocumentRegistry.Context) {
    super();
    this.context = context;
    this.node.tabIndex = -1;
    this.addClass(TEST_CLASS);

    this._onTitleChanged();
    context.pathChanged.connect(this._onTitleChanged, this);

    context.ready.then(() => {
      if (this.isDisposed) {
        return;
      }
      // this._render();
      console.log('TestWidget', context.model);
      context.model.contentChanged.connect(this.update, this);
      context.fileChanged.connect(this.update, this);
      this._ready.resolve(void 0);
    });
  }

  /**
   * The image widget's context.
   */
  readonly context: DocumentRegistry.Context;

  /**
   * A promise that resolves when the image viewer is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Handle `update-request` messages for the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isDisposed || !this.context.isReady) {
      return;
    }
    // this._render();
    console.log('update-request');
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }

  /**
   * Handle a change to the title.
   */
  private _onTitleChanged(): void {
    this.title.label = PathExt.basename(this.context.path);
  }

  /**
   * Render the widget content.
   */
  // private _render(): void {
  //   let context = this.context;
  //   let cm = context.contentsModel;
  //   if (!cm) {
  //     return;
  //   }
  //   let content = context.model.toString();
  //   console.log('Test: content=', content);
  //   // let src = `data:${cm.mimetype};${cm.format},${content}`;
  //   // let node = this.node.querySelector('img') as HTMLImageElement;
  //   // node.setAttribute('src', src);
  // }

  private _ready = new PromiseDelegate<void>();
}


/**
 * A widget factory for images.
 */
export
class TestWidgetFactory extends ABCWidgetFactory<TestWidget, DocumentRegistry.IModel> {
  /**
   * Create a new widget given a context.
   */
  protected createNewWidget(context: DocumentRegistry.IContext<DocumentRegistry.IModel>): TestWidget {
    return new TestWidget(context);
  }
}
