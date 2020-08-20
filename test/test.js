const test = require('ava');

const emailRegexSafe = require('..');

const string = `
__boop@beep.com
foo@foo.com
foo@f.com
foo@.com
some@sub.domain.jpg.co.uk.com.jpeg
_._boop@beep.com
bepp.test@boop.com
beep....foo@foo.com
beep..@foo.com
beep@bar.com.
beep.boop.boop.@foo.com
beep@boop.com .@foo.com
foo@_ $foobar@gmail.com
+foo@gmail.com
+$foo@gmail.com
+@test.com
++@test.com+@testtest.com
url：www.example.com reserved.[subscribe.example.com/subscribe.aspx?foo=zaaaa@example.io&beep=foo124123@example.nl
##rfc822;beep@test.co.uk
/images/some_logo@2x.jp
/images/foobar@2x.jpeg ----------------------------------------[beep.boop.net/foo.cfm?email=beep@example.ai\nwww.foo-beep.es was invalid
cid:image001.png@01bazz23.mx1e6980]www.facebook.com/example[cid:image002.png@03j570cf.ee1e6980]twitter.com/foobar[cid:image000.png@03j570cfzaaaazz.ee1e6980]http://www.linkedin.com/company/beep?trk=company_logo[cid:image005.png@03j570cf.es
foo@bar example.@gmail.com
foo+test@gmail.com
f=nr@context",c=e("gos") 'text@example.com, some text'
fazboop <foo@bar.com> beep baz@boop.com
foo@fe.com admin@2606:4700:4700::1111
fe@fe az@as test@1.2.3.4 foo@com.jpeg
foo@com.jpeg`;

test('parses matches', (t) => {
  t.deepEqual(string.match(emailRegexSafe()), [
    'boop@beep.com',
    'foo@foo.com',
    'foo@f.com',
    'some@sub.domain.jpg.co.uk.com.jp',
    'boop@beep.com',
    'bepp.test@boop.com',
    'beep....foo@foo.com',
    'beep..@foo.com',
    'beep@bar.com',
    'beep.boop.boop.@foo.com',
    'beep@boop.com',
    'foobar@gmail.com',
    'foo@gmail.com',
    'foo@gmail.com',
    'test.com+@testtest.com',
    'zaaaa@example.io',
    'foo124123@example.nl',
    'beep@test.co.uk',
    'some_logo@2x.jp',
    'foobar@2x.jp',
    'beep@example.ai',
    'image001.png@01bazz23.mx',
    'image002.png@03j570cf.ee',
    'image000.png@03j570cfzaaaazz.ee',
    'image005.png@03j570cf.es',
    'example.@gmail.com',
    'foo+test@gmail.com',
    'text@example.com',
    'foo@bar.com',
    'baz@boop.com',
    'foo@fe.com',
    'test@1.2.3.4',
    'foo@com.jp',
    'foo@com.jp'
  ]);
});
