
import {component} from 'd3-component';

export default function() {

  let header = component('div', 'panel-header')
    .render( (selection, d) => selection.text(d));

  let list = component('div', 'panel-body')
    .render( (selection, items) => selection.call(marker, items));

  let marker = component('div', 'panel-item')
    .create( (s, d) => s.on('click', d => d.doc.setCursor(d.find().from)))
    .render( (s, d) => {
      s.text(d => d.name || '...')
       .classed('fold', d => d._fold)
     })
    .destroy( (s, d) => {
      s.on('click', null);
      s.remove();
    });

  return component("div", "panel")
    .render( (selection, d) => {
      selection
        .call(header, d.title)
        .call(list, [d.items])
      });
}
