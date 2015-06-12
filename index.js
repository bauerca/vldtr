
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

function Validation(name, config) {
    function test(value) {
        var err = !config.check(value) && config.error;
        if (err) return test._err || err;
    }

    return equipTest(test);
}


function equipTest(test) {
    test.and = And.bind(null, test);
    test.or = Or.bind(null, test);
    test.withError = function(err) {
        test._err = err;
        return test;
    };
    return test;
}

module.exports = Validation;
