const path = require('node:path');
const { readFileSync } = require('node:fs');
const { Script } = require('node:vm');
const test = require('ava');
const { JSDOM, VirtualConsole } = require('jsdom');

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

const script = new Script(
  readFileSync(path.join(__dirname, '..', 'dist', 'email-regex-safe.min.js'))
);

const dom = new JSDOM(``, {
  url: 'http://localhost:3000/',
  referrer: 'http://localhost:3000/',
  contentType: 'text/html',
  includeNodeLocations: true,
  resources: 'usable',
  runScripts: 'dangerously',
  virtualConsole
});

dom.runVMScript(script);

test('should work in the browser', (t) => {
  t.true(typeof dom.window.emailRegexSafe === 'function');
  t.true(dom.window.emailRegexSafe({ exact: true }).test('hello@example.com'));
  t.deepEqual(
    'some long string with foo@bar.com in it'.match(
      dom.window.emailRegexSafe()
    ),
    ['foo@bar.com']
  );
});
