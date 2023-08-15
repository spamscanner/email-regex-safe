# email-regex-safe

[![build status](https://github.com/spamscanner/email-regex-safe/actions/workflows/ci.yml/badge.svg)](https://github.com/spamscanner/email-regex-safe/actions/workflows/ci.yml)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/spamscanner/email-regex-safe.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/email-regex-safe.svg)](https://npm.im/email-regex-safe)

> Regular expression matching for email addresses. Maintained, configurable, more accurate, and browser-friendly alternative to [email-regex][]. Works in Node v14+ and browsers. **Maintained for [Spam Scanner][spam-scanner] and [Forward Email][forward-email]**.


## Table of Contents

* [Foreword](#foreword)
* [Install](#install)
* [Usage](#usage)
  * [Node](#node)
  * [Browser](#browser)
* [Options](#options)
* [How to validate an email address](#how-to-validate-an-email-address)
* [Limitations](#limitations)
* [Contributors](#contributors)
* [License](#license)


## Foreword

Previously we were using [email-regex][] through our work on [Spam Scanner][spam-scanner] and [Forward Email][forward-email].  However this package has [too many issues](https://github.com/sindresorhus/email-regex/issues/9) and [false positives](https://github.com/sindresorhus/email-regex/issues/2).

This package should hopefully more closely resemble real-world intended usage of an email regular expression, and also let you configure several [Options](#options).  Please check out [Forward Email][forward-email] if this package helped you, and explore our source code on GitHub which shows how we use this package.

**It will not perform strict email validation, but instead hints the complete matches resembling an email address.  We recommend to use [validator.isEmail][validator-email] for validation (e.g. `validator.isEmail(match)`).**


## Install

**NOTE:** The default behavior of this package will attempt to load [re2](https://github.com/uhop/node-re2) (it is an optional peer dependency used to prevent regular expression denial of service attacks and more).  If you wish to use this behavior, you must have `re2` installed via `npm install re2` – otherwise it will fallback to using normal `RegExp` instances.  As of v4.0.0 we added an option if you wish to force this package to not even attempt to load `re2` (e.g. it's in your `node_modules` [but you don't want to use it](https://github.com/spamscanner/url-regex-safe/issues/28)) – simply pass `re2: false` as an option.

[npm][]:

```sh
npm install email-regex-safe
```


## Usage

### Node

```js
const emailRegexSafe = require('email-regex-safe');

const str = 'some long string with foo@bar.com in it';
const matches = str.match(emailRegexSafe());

for (const match of matches) {
  console.log('match', match);
}

console.log(emailRegexSafe({ exact: true }).test('hello@example.com'));
```

### Browser

Since [RE2][] is not made for the browser, it will not be used.  If there were to be any regex vulnerabilities, they would only crash the user's browser tab, and not your server (as they would on the Node.js side without the use of [RE2][]).

#### VanillaJS

This is the solution for you if you're just using `<script>` tags everywhere!

```html
<script src="https://unpkg.com/email-regex-safe"></script>
<script type="text/javascript">
  (function() {
    var str = 'some long string with foo@bar.com in it';
    var matches = str.match(emailRegexSafe());

    for (var i=0; i<matches.length; i++) {
      console.log('match', matches[i]);
    }

    console.log(emailRegexSafe({ exact: true }).test('hello@example.com'));
  })();
</script>
```

#### Bundler

Assuming you are using [browserify][], [webpack][], [rollup][], or another bundler, you can simply follow [Node](#node) usage above.


## Options

| Property       | Type    | Default Value                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `re2`          | Boolean | `true`                                                       | Attempt to load `re2` to use instead of `RegExp` for creating new regular expression instances.  If you pass `re2: false`, then `re2` will not even be attempted to be loaded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `exact`        | Boolean | `false`                                                      | Only match an exact String. Useful with `regex.test(str)` to check if a String is an email address. We set this to `false` by default as the most common use case for a RegExp parser is to parse out emails, as opposed to check strict validity; we feel this closely more resembles real-world intended usage of this package.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `strict`       | Boolean | `false`                                                      | If `true`, then it will allow any TLD as long as it is a minimum of 2 valid characters. If it is `false`, then it will match the TLD against the list of valid TLD's using [tlds](https://github.com/stephenmathieson/node-tlds#readme).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `gmail`        | Boolean | `true`                                                       | Whether or not to abide by Gmail's rules for email usernames (see Gmail's [Create a username article](https://support.google.com/mail/answer/9211434) for more insight). Note that since [RE2][] does not support negative lookahead nor negative lookbehind, we are leaving it up to you to filter out a select few invalid matches while using `gmail: true`.  Invalid matches would be those that end with a "." (period) or "+" (plus symbol), or have two or more consecutive ".." periods in a row anywhere in the username portion.  We recommend to use `str.matches(emailSafeRegex())` to get an Array of all matches, and then filter those that pass [validator.isEmail][validator-email] after having end period(s) and/or plus symbol(s) stripped from them, as well as filtering out matches with repeated periods. |
| `utf8`         | Boolean | `true`                                                       | Whether or not to allow UTF-8 characters for email usernames.  This Boolean is only applicable if `gmail` option is set to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `localhost`    | Boolean | `true`                                                       | Allows localhost in the URL hostname portion. See the [test/test.js](test/test.js) for more insight into the localhost test and how it will return a value which may be unwanted. A pull request would be considered to resolve the "pic.jp" vs. "pic.jpg" issue.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `ipv4`         | Boolean | `true`                                                       | Match against IPv4 URL's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `ipv6`         | Boolean | `false`                                                      | Match against IPv6 URL's. This is set to `false` by default, since IPv6 is not really supported anywhere for email addresses, and it's not even included in [validator.isEmail][validator-email]'s logic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tlds`         | Array   | [tlds](https://github.com/stephenmathieson/node-tlds#readme) | Match against a specific list of tlds, or the default list provided by [tlds](https://github.com/stephenmathieson/node-tlds#readme).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `returnString` | Boolean | `false`                                                      | Return the RegExp as a String instead of a `RegExp` (useful for custom logic, such as we did with [Spam Scanner][spam-scanner]).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |


## How to validate an email address

If you would like to validate email addresses found, then you should use the [validator.isEmail][validator-email] method.  This will further enforce the email RFC specification limitations of 64 characters for the username/local part of the email address, 254 for the domain/hostname portion, and 255 in total; including the "@" (at symbol).


## Limitations

**This limitation only applies if you are using `re2`**: Since we cannot use regular expression's "negative lookbehinds" functionality (due to [RE2][] limitations), we could not merge the logic from this [pull request](https://github.com/kevva/url-regex/pull/67/commits/6c31d81c35c3bb72c413c6e4af92a37b2689ead2).  This would have allowed us to make it so `example.jpeg` would match only if it was `example.jp`, however if you pass `example.jpeg` right now it will extract `example.jp` from it (since `.jp` is a TLD).  An alternative solution may exist, and we welcome community contributions regarding this issue.


## Contributors

| Name              | Website                    |
| ----------------- | -------------------------- |
| **Forward Email** | <https://forwardemail.net> |


## License

[MIT](LICENSE) © [Forward Email](https://forwardemail.net)


##

[npm]: https://www.npmjs.com/

[re2]: https://github.com/uhop/node-re2

[browserify]: https://github.com/browserify/browserify

[webpack]: https://github.com/webpack/webpack

[rollup]: https://github.com/rollup/rollup

[email-regex]: https://github.com/sindresorhus/email-regex

[spam-scanner]: https://spamscanner.net

[forward-email]: https://forwardemail.net

[validator-email]: https://github.com/validatorjs/validator.js/blob/master/src/lib/isEmail.js
