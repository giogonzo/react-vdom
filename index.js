var falsy = [null, undefined, false];

function compact(arr) {
  return arr.filter(function (x) {
    return falsy.indexOf(x) === -1;
  });
}

function flatten(arr) {
  return [].concat.apply([], arr);
}

function getDOM(tag, _, context) {
  var dom = { tag: tag.type };
  var children;
  for (var prop in tag.props) {
    if (tag.props.hasOwnProperty(prop)) {
      if (prop === 'children') {
        children = vdom(tag.props[prop], undefined, context);
      } else {
        dom.attrs = dom.attrs || {};
        dom.attrs[prop] = vdom(tag.props[prop], undefined, context);
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

function getComponent(component, state, context) {
  var instance = new component.type(component.props);
  if (typeof instance.render === 'function') {
    if (typeof state !== 'undefined') {
      instance.state = state;
    }
    if (typeof context !== 'undefined') {
      instance.context = context;
    }
    return vdom(instance.render(), undefined, context);
  }
  return vdom(instance, undefined, context);
}

function vdom(x, state, context) {
  try {
    if (Array.isArray(x)) {
      x = compact(flatten(x)).map(function (y) {
        return vdom(y, undefined, context);
      });
      return x.length > 1 ? x : x[0];
    }
    if (falsy.indexOf(x) === -1) {
      if (typeof x.type === 'string') {
        return getDOM(x, undefined, context);
      }
      if (x.hasOwnProperty('$$typeof')) {
        return getComponent(x, state, context);
      }
    }
    return x;
  } catch (e) {
    console.error('[react-vdom]', e); // eslint-disable-line
    return {
      tag: 'error',
      children: e.message + ', stack: ' + e.stack
    };
  }
}

module.exports = vdom;