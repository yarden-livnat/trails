
import {component} from 'd3-component';

const PANEL_CLASS = 'sql-overview-panel';
const HEADER_CLASS = 'sql-overview-panel-header';
const BODY_CLASS = 'sql-overview-panel-body';
const ITEM_CLASS = 'sql-overview-panel-item';

export default function() {

  let header = component('div', HEADER_CLASS)
    .render( (selection, d) => selection.text(d));

  let list = component('div', BODY_CLASS)
    .render( (selection, items) => selection.call(marker, items));

  let marker = component('div', ITEM_CLASS)
    .create( (s, d) => { s.on('click', d => /*d.doc.setCursor*/ d.doc.getEditor().scrollIntoView(d.find().from)) })
    .render( (s, d) => {
      s.text(d => d.name || '...')
       .classed('fold', d => d._fold)
     })
    .destroy( (s, d) => {
      s.on('click', null);
      s.remove();
    });

  return component("div", PANEL_CLASS)
    .render( (selection, d) => {
      selection
        .call(header, d.title)
        .call(list, [d.items])
      });
}
