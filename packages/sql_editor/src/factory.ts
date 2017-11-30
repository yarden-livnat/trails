
import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  CodeEditor, IEditorServices, IEditorMimeTypeService, CodeEditorWrapper
} from '@jupyterlab/codeeditor';

import {
  FileEditorFactory
} from '@jupyterlab/fileeditor';


import {SQLEditor} from './sqleditor';

export
class SQLEditorFactory extends ABCWidgetFactory<SQLEditor, DocumentRegistry.IModel> {

  constructor(options: FileEditorFactory.IOptions) {
    super(options.factoryOptions);
    this._services = options.editorServices;
  }

  protected createNewWidget(context: DocumentRegistry.CodeContext): SQLEditor {
    let func = this._services.factoryService.newDocumentEditor.bind(
      this._services.factoryService);
    let factory: CodeEditor.Factory = options => {
      return func(options);
    };

    return new SQLEditor({
      factory,
      context,
      mimeTypeService: this._services.mimeTypeService
    });
  }

  private _services: IEditorServices;
}
