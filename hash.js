const bcrypt = require("bcrypt");

bcrypt.hash("l7n22v29_", 9)
.then(hash => {
    console.log(hash);
});