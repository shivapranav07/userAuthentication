const mongoose  = require("mongoose");
mongoose.connect("mongodb+srv://dasishivapranav:shiva123dasi@cluster0.8gehv6b.mongodb.net/atlstack");

const userSchema = new mongoose.Schema({
 username: String,
 password: String,
 firstName: String,
 lastName: String
});

 


const User = mongoose.model('User',userSchema);
module.exports = {
  User
};