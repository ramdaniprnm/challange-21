const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    hashPassword: function (password) {
        return bcrypt.hashSync(password, saltRounds);
    },
    comparePassword: function (password, hash) {
        return bcrypt.compareSync(password, hash); // true
    }
}