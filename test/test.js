/** @jsx React.DOM */

"use strict";
var assert = require('assert');
var React = require('react'); 
var vdom = require('../index');

//
// setup
//

var eq = assert.deepEqual;

var Anchor = React.createClass({displayName: 'Anchor',
  render: function () {
    return (
      React.DOM.a({href: this.props.href}, this.props.children)
    );
  }
});

describe('vdom', function () {
  var component = Anchor({href: '#section'}, 'title');
  it('should return a assertable DOM', function () {
    eq({
      tag: 'a',
      attrs: {href: '#section'},
      children: 'title'
    }, vdom(component));
  });
});
