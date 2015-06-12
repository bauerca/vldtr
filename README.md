# vldtr

Playing around. This javascript library is super small and does
this kinda thing:

```js
var validator = require('vldtr');
var _ = require('underscore');
var expect = require('expect.js');

var isNumber = validator('isNumber', {
    check: _.isNumber,
    error: 'Not a number, dude.'
});

expect(isNumber(123)).to.be(undefined);
expect(isNumber('hi')).to.be('Not a number, dude');

var isString = validator('isString', {
    check: _.isString,
    error: 'Not a string, dudette.'
});

expect(isString(123)).to.be('Not a string, dudette');
expect(isString('hi')).to.be(undefined);

var isDate = isNumber.or(isString).withError(
    'Not a valid date, human. We need milliseconds since Epoch or UTC.'
);

expect(isDate(1234)).to.be(undefined);
expect(isDate('TotallyADate')).to.be(undefined);

expect(isDate(['arrayyyy!'])).to.be(
    'Not a valid date, human. We need milliseconds since Epoch or UTC.'
);
```

## License

MIT
