/* Import des modules necessaires */
const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")


/* Schema User */
const ModelUser = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: /*defaultRequire*/ true},
})

  //defaultRequire = {
  //  minlength: 10,   // <Number>   At least 10 characters long (optional)
  //  uppercase: true, // <Boolean>  Have at least 1 uppercase character
  //  lowercase: true, // <Boolean>  Have at least 1 lowercase character
  //  number: true,    // <Boolean>  Have at least 1 number
  //  nonalpha: true   // <Boolean>  Have at least 1 Nonalpha character
  //  }

/* Verification email unique */
ModelUser.plugin(uniqueValidator)

module.exports = mongoose.model("User", ModelUser)