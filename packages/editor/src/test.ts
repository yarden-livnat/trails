import * as CodeMirror from 'codemirror';
import {Editor} from './editor';

var editor = Editor(document.getElementById("editor") as HTMLTextAreaElement, {
  extraKeys: {
    "Ctrl-Q": function(cm: any) { cm.foldCode(cm.getCursor()); }
  }
});

let f = {line:0, ch: 0};
let t = {line: 5, ch: 3};
// editor.getDoc().markText(f, t, { className:'foo'});
let text = document.createTextNode("widget");
let widget = document.createElement("span");
widget.appendChild(text);
widget.className = "CodeMirror-foldmarker";
editor.getDoc().setBookmark({line:2, ch:3}, {
  widget: widget
});


editor.on('overview', (cm: CodeMirror.Editor, ...data) => {
  console.log('overview:bookmarks=', data[0]);
});

editor.on('change', (cm: CodeMirror.Editor, obj) => console.log('change'));
