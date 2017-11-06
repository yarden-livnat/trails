
// import * as d3 from 'd3';

import {component} from 'd3-component';

export default function() {

  let header = component('div', 'panel-header')
    .render( (selection, d) => selection.text(d));

  let list = component('div', 'panel-body')
    .render( (selection, items) => selection.call(marker, items));


  let marker = component('div', 'panel-item')
    .create( (s, d) => {
      s.append('span').text('#');
      s.append('span').text('***')
      d.on('fold', (a) => console.log('fold', a, d))
    })
    .render( (s, d) => {
      s.selectAll('span').data(['$', d.name || '---'])
        .each( d => console.log(d))
        .text( d => d);


    });


  return component("div", "panel")
    .render( (selection, d) => {
      selection
        .call(header, d.title)
        .call(list, [d.items])
      });
}
