'use strict';

var React = require('react');
var ReactElement = require('react/lib/ReactElement');

var falsy = [null, undefined, false];

function compact(arr) {
  return arr.filter(function (x) {
    return falsy.indexOf(x) === -1;
  });
}

function flatten(arr) {
  return [].concat.apply([], arr);
}

function vdomDOM(tag, state, context) {
  var dom = {tag: tag.type};
  var children;
  for (var prop in tag.props) {
    if (tag.props.hasOwnProperty(prop)) {
      if (prop === 'children') {
        children = vdom(tag.props[prop], state, context);
      } else {
        dom.attrs = dom.attrs || {};
        dom.attrs[prop] = vdom(tag.props[prop], state, context);
      }
    }
  }
  if (falsy.indexOf(children) === -1) {
    if (Array.isArray(children)) {
      children = compact(flatten(children));
      if (children.length === 1) {
        children = children[0];
      }
    }
    dom.children = children;
  }
  return dom;
}

function vdomReactClassComponent(Class, state, context) {
  var instance = new Class.type(Class.props);
  if (typeof state !== 'undefined') { instance.state = state; }
  if (typeof context !== 'undefined') { instance.context = context; }
  return vdom(instance.render(), state, context);
}

function vdomReactElement(reactElement, state, context) {
  return typeof reactElement.type === 'string' ?
    vdomDOM(reactElement, state, context) :
    vdomReactClassComponent(reactElement, state, context);
}

function vdomReactComponent(reactComponent, state, context) {
  if (typeof reactComponent.render !== 'function') {
    throw new Error('[react-vdom] component ' + reactComponent.constructor.name + ': missing render() method');
  }
  if (typeof state !== 'undefined') {
    reactComponent.state = state;
  }
  if (typeof context !== 'undefined') {
    reactComponent.context = context;
  }
  return vdom(reactComponent.render(), state, context);
}

function vdom(x, state, context) {
  try {
    if (Array.isArray(x)) {
      x = compact(flatten(x)).map(function (y) {
        return vdom(y, state, context);
      });
      return x.length > 1 ? x : x[0];
    } else if (x instanceof React.Component) {
      return vdomReactComponent(x, state, context);
    } else if (x instanceof ReactElement) {
      return vdomReactElement(x, state, context);
    }
    return x;
  } catch (e) {
    return {
      tag: 'error',
      children: e.message
    };
  }
}

module.exports = vdom;