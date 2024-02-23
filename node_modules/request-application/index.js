/**
 * Dependencies.
 */

const text = require('request-text')

/**
 * Allowed whitespace is defined in RFC 7159
 * @see http://www.rfc-editor.org/rfc/rfc7159.txt
 */

const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/

/**
 * Return a promise that resolves when  x-www-form-urlencoded request is parsed.
 * Reject promise with 400 status error otherwise.
 *
 * @param {HttpIncomingMessage} request
 * @param {Object} options
 * @return {Promise}
 * @api public
 */

module.exports = function (request, options) {
  return text(request, options).then(str => {
    try {
      if (!strictJSONReg.test(str)) throw new Error('invalid JSON, only supports object and array')
      return JSON.parse(str)
    } catch (err) {
      err.statusCode = 400
      err.status = 400
      err.body = str
      throw err
    }
  })
}
