var Validation = require('..');
var expect = require('expect.js');
var _ = require('underscore');

function i18n(str) { return str; }

describe('Validation', function() {
    it('should create validator', function() {
        var isArray = Validation('isArray', {
            check: value => Array.isArray(value),
            error: i18n('Not an array, beep.')
        });

        expect(isArray).to.be.a('function');
        expect(isArray('nope')).to.be('Not an array, beep.');
    });

    describe('withError()', function() {
        it('should override error message', function() {
            var isArray = Validation('isArray', {
                check: value => Array.isArray(value),
                error: i18n('Not an array, beep.')
            });

            var isMyArray = isArray.withError(
                i18n('Sorry sir, that appears to be not quite an array')
            );

            expect(isMyArray('nope')).to.be('Sorry sir, that appears to be not quite an array');
        });
    });

    describe('or()', function() {
        it('should work', function() {
            var isNumber = Validation('isNumber', {
                check: _.isNumber,
                error: 'Not a number, dude.'
            });
            var isString = Validation('isString', {
                check: _.isString,
                error: 'Not a string, dudette.'
            });
            // .withError() overrides both isNumber and isString errors.
            var isDate = isNumber.or(isString).withError(
                'Not a valid birthdate, human. We need milliseconds since Epoch or UTC.'
            );

            expect(isDate(1234)).to.be(undefined);
            expect(isDate('TotallyADate')).to.be(undefined);
            expect(isDate(['arrayyyy!'])).to.be(
                'Not a valid birthdate, human. We need milliseconds since Epoch or UTC.'
            );
        });
    });

    describe('and()', function() {
        it('should work', function() {
            var isString = Validation('isString', {
                check: _.isString,
                error: 'Not a string, dudette.'
            });
            var stringIsShort = Validation('stringIsShort', {
                check: value => value.length < 5,
                error: 'Way too long.'
            });
            var isShortString = isString.and(stringIsShort);
            expect(isShortString('yay!')).to.be(undefined);
            expect(isShortString('oh boy I am too excited')).to.be('Way too long.');
            expect(isShortString(0xdeadbeef)).to.be('Not a string, dudette.');
        });
    });

    describe('cross-field/nested validation', function() {
        var passwordIsConfirmed;

        before(function() {
            var isString = Validation('isString', {
                error: 'Not a string, dudette.',
                check: _.isString
            });

            passwordIsConfirmed = Validation('', {
                error: 'Password and confirmation mismatch.',
                check: value => value.password === value.confirm_password,
                where: {
                    password: isString,
                    confirm_password: isString
                }
            });
        });

        it('should validate children', function() {
            expect(passwordIsConfirmed({password: null, confirm_password: 'hi'})).to.eql({password: 'Not a string, dudette.'});
            expect(passwordIsConfirmed({password: 'hi', confirm_password: null})).to.eql({confirm_password: 'Not a string, dudette.'});
            expect(passwordIsConfirmed({password: 'hi', confirm_password: 'HI'})).to.be('Password and confirmation mismatch.');
        });

        describe('withError()', function() {
            it('should override error message for combined validation', function() {
                var userPasswordIsConfirmed = passwordIsConfirmed.withError(
                    'User password confirmation mismatch.'
                );

                expect(userPasswordIsConfirmed({password: null, confirm_password: 'hi'})).to.eql({password: 'Not a string, dudette.'});
                expect(userPasswordIsConfirmed({password: 'hi', confirm_password: null})).to.eql({confirm_password: 'Not a string, dudette.'});
                expect(userPasswordIsConfirmed({password: 'hi', confirm_password: 'HI'})).to.be('User password confirmation mismatch.');
            });
        });
    });

    xit('should do everything else', function() {
        var isShort = Validation('isShort', {
            check: value => value.length < 4,
            error: i18n('Array was way too long.')
        });
        
        var isShortArray = isArray.and(isShort);
        var isMyShortArray = isShortArray.withErrors({
            'isShort': 'Array too long, beep.'
        });
        
        var err;
        err = isShortArray([1, 2, 3, 4, 5]); // Array was way too long.
        err = isMyShortArray([1, 2, 3, 4, 5]); // Array too long, beep.
        
        var isObject = Validation('isObject', {
            check: value => _.isObject(value),
            message: i18n('Dude, not an object.')
        });

        
        var isRequired = Validation('isRequired', {
            check: value => !!value,
            error: i18n('A value is required.')
        });
        
        var isBirthdate = (
            isRequired
            .withError(i18n('Your birthdate is required.')) // Just overrides isRequired error.
            .and(isDate)
        );

        var arrayIsAllStrings = Validation('arrayIsAllStrings', {
            check: (value) => _.all(value.map(isString)),
            error: i18n('Array element was not a string')
        });
        
        var isArrayOfStrings = isArray.and(arrayIsAllStrings);

        var Model = {
            arr: isMyArray,
            short_arr: isMyShortArray,
            composite: {
                n1: isNumber,
                n2: isNumber
            }
        };
    });
});

/*
xdescribe('Other stuff', function() {
    it('should do stuff', function() {
        var TypeInput = React.createClass({
            render() {
                return <div>
                    {this.state.error && <div className="error">{this.state.error}</div>}
                    <input
                        value={this.state.value}
                        onChange={this.onChange}
                    />
                </div>;
            },
        
            onChange(event) {
                this.setState({
                    value: event.target.value,
                    error: Num.validate(event.target.value)
                });
            }
        });
    });
});
*/
