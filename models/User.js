const { Schema, model } = require('mongoose')
const crypto = require('crypto')

const userSchema = new Schema({
  username: { type: String,  required: true },
  email: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  // date: { type: Date, default: Date.now()}
})

userSchema.methods.setPassword = function (password) {
  // Creating a unique salt for a particular user
  this.salt = crypto.randomBytes(16).toString('hex')
  // Hashing user's salt and password with 1000 iterations,
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`)
}

userSchema.methods.validPassword = function (password) {
  let _hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`)
  return this.hash === _hash
}

const User = model('User', userSchema)
module.exports = User
