var extend = require('xtend/mutable');

function And(test1, test2) {
    function test(value) {
        var err = test1(value) || test2(value);
        if (err) return test._err || err;
    }

    return equipTest(test);
}

function Or(test1, test2) {
    function test(value) {
        var err = test1(value);
        if (err) {
            err = test2(value);
            if (err) return test._err || err;
        }
    }

    return equipTest(test);
}


function checkWhere(tests, values) {
    values = values || {};
    var errors = {};
    var error;

    for (var key in tests) {
        error = tests[key](values[key]);
        if (error) errors[key] = error;
    }

    if (Object.keys(errors).length) {
        return errors;
    }
}


function Validation(name, config) {
    function test(value) {
        var err = (
            (test._where && checkWhere(test._where, value)) ||
            (!config.check(value) && config.error)
        );
        if (err) return test._err || err;
    }

    test._where = config.where;
    return equipTest(test);
}


function equipTest(test) {
    test.and = And.bind(null, test);
    test.or = Or.bind(null, test);
    test.withError = function(err) {
        test._err = err;
        return test;
    };
    test.where = function(tests) {
        test._where = extend(test._where || {}, tests);
        return test;
    };
    return test;
}


module.exports = Validation;
