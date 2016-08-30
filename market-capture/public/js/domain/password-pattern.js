// Domain object of the password generator domain object
function PasswordGeneratorPatternDomain() {
    var maxLength = 18;
    var minLength = 12;
    var uppercaseMinCount = 3;
    var lowercaseMinCount = 3;
    var numberMinCount = 2;
    var specialMinCount = 2;
    var UPPERCASE_RE = /([A-Z])/g;
    var LOWERCASE_RE = /([a-z])/g;
    var NUMBER_RE = /([\d])/g;
    var SPECIAL_CHAR_RE = /([\?\-])/g;
    var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;
}

PasswordGeneratorPatternDomain.prototype = {

    getMaxLength : function() {
        return this.maxLength;
    },

    setMaxLength : function(len) {
        this.maxLength = len;
    },

    getMinLength : function() {
        return this.minLength;
    },

    setMinLength : function(len) {
        this.minLength = len;
    },

    getUppercaseMinCount : function() {
        return this.uppercaseMinCount;
    },

    setUppercaseMinCount : function(count) {
        this.uppercaseMinCount = count;
    },

    getLowercaseMinCount : function() {
        return this.lowercaseMinCount;
    },

    setLowercaseMinCount : function() {

    },


// TODO complete writing all the domain objects here.

};

module.exports = PasswordGeneratorPatternDomain;