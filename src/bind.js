// Polyfill for Function.prototype.bind
export default function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}
