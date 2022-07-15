/* Import des modules necessaires */
const mongoose = require("mongoose")

/* Schema Sauce */
const ModelSauce = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  likes: { type: Number, required: true },
  usersLiked: { type: ["String <userId>"], required: true },
})

module.exports = mongoose.model("Sauce", ModelSauce)