const ipRegex = require('ip-regex');
const tlds = require('tlds');

const ipv4 = ipRegex.v4().source;
const ipv6 = ipRegex.v6().source;
const host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
const strictTld = '(?:[a-z\\u00a1-\\uffff]{2,})';
const defaultTlds = `(?:${tlds.sort((a, b) => b.length - a.length).join('|')})`;

let RE2;
let hasRE2;

module.exports = (options) => {
  options = {
    //
    // attempt to use re2, if set to false will use RegExp
    // (we did this approach because we don't want to load in-memory re2 if users don't want it)
    // <https://github.com/spamscanner/url-regex-safe/issues/28>
    //
    re2: true,
    exact: false,
    strict: false,
    gmail: true,
    utf8: true,
    localhost: true,
    ipv4: true,
    ipv6: false,
    returnString: false,
    ...options
  };

  /* istanbul ignore next */
  const SafeRegExp =
    options.re2 && hasRE2 !== false
      ? (() => {
          if (typeof RE2 === 'function') return RE2;
          try {
            RE2 = require('re2');
            return typeof RE2 === 'function' ? RE2 : RegExp;
          } catch {
            hasRE2 = false;
            return RegExp;
          }
        })()
      : RegExp;

  // Add ability to pass custom list of tlds
  // <https://github.com/kevva/url-regex/pull/66>
  const tld = `(?:\\.${
    options.strict
      ? strictTld
      : options.tlds
      ? `(?:${options.tlds.sort((a, b) => b.length - a.length).join('|')})`
      : defaultTlds
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
