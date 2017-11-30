
import {
  ABCWidgetFactory, DocumentRegistry
} from '@jupyterlab/docregistry';

import {SQLEditor} from './sqleditor';

export
class SQLEditorFactory extends ABCWidgetFactory<SQLEditor, DocumentRegistry.IModel> {

  protected createNewWidget(context: DocumentRegistry.CodeContext): SQLEditor {
    return new SQLEditor({context});
  }
}
