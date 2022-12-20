/**
 * @constructor
 */
function AggregateError(errors, message) {
  (this.name = 'AggregateError'), (this.errors = errors);
  this.message = message || '';
}
AggregateError.prototype = Error.prototype;

export default AggregateError;
