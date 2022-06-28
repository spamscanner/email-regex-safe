const RE2 = require('re2');
const ipRegex = require('ip-regex');
const tlds = require('tlds');

/* istanbul ignore next */
const SafeRegExp = typeof RE2 === 'function' ? RE2 : RegExp;
const ipv4 = ipRegex.v4().source;
const ipv6 = ipRegex.v6().source;

module.exports = (options) => {
  // eslint-disable-next-line prefer-object-spread
  options = Object.assign(
    {
      exact: false,
      strict: false,
      gmail: true,
      utf8: true,
      localhost: true,
      ipv4: true,
      ipv6: false,
      tlds,
      returnString: false
    },
    options
  );

  const host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
  const domain =
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';

  // Add ability to pass custom list of tlds
  // <https://github.com/kevva/url-regex/pull/66>
  const tld = `(?:\\.${
    options.strict
      ? '(?:[a-z\\u00a1-\\uffff]{2,})'
      : `(?:${options.tlds.sort((a, b) => b.length - a.length).join('|')})`
  })`;

  // <https://github.com/validatorjs/validator.js/blob/master/src/lib/isEmail.js>
  const emailUserPart = options.gmail
    ? // https://support.google.com/mail/answer/9211434?hl=en#:~:text=Usernames%20can%20contain%20letters%20(a%2Dz,in%20a%20row.
      // cannot contain: &, =, _, ', -, +, comma, brackets, or more than one period in a row
      // note that we are parsing for emails, not enforcing username match, so we allow +
      '[^\\W_](?:[\\w\\.\\+]+)' // NOTE: we don't end with `[^\\W]` here since Gmail doesn't do this in webmail
    : options.utf8
    ? "[^\\W_](?:[a-z\\d!#\\$%&'\\.\\*\\+\\-\\/=\\?\\^_`{\\|}~\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+)"
    : "[^\\W_](?:[a-z\\d!#\\$%&'\\.\\*\\+\\-\\/=\\?\\^_`{\\|}~]+)";

  let regex = `(?:${emailUserPart}@(?:`;
  if (options.localhost) regex += 'localhost|';
  if (options.ipv4) regex += `${ipv4}|`;
  if (options.ipv6) regex += `${ipv6}|`;
  regex += `${host}${domain}${tld}))`;

  // Add option to return the regex string instead of a RegExp
  if (options.returnString) return regex;

  return options.exact
    ? new SafeRegExp(`(?:^${regex}$)`, 'i')
    : new SafeRegExp(regex, 'ig');
};
