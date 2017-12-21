

import {
  CodeEditor
} from '@jupyterlab/codeeditor';

export
interface ISQLModel extends CodeEditor.IModel {

}

export
class SQLModel extends CodeEditor.Model {
  constructor(options: SQLModel.IOptions) {
    super({});
  }
}


export
namespace SQLModel {
  export interface IOptions {}
}
