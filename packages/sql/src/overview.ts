import {
  Widget, PanelLayout
} from '@phosphor/widgets';


export
class Overview extends Widget {
  constructor() {
    super();
    this.addClass('trails-sql-overview');
  }

  set bookmarks(data: Map<number, CodeMirror.TextMarker>) {
    console.log('new bookmarks', data);
  }

  readonly _bookmarks: Map<number, CodeMirror.TextMarker>;
}
