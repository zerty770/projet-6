/*** Import des modules nécessaires */
const express = require('express')
const mongoose = require("mongoose")
const cors = require('cors')
const path = require('path')


/*****************************/
/*** Initialisation de l'API */
const app = express()

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization"
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


/*** Import des modules de routage */
const sauceRoutes = require("./routes/sauce")
const userRoutes = require("./routes/user")

/*** Mise en place du routage */
app.use("/images", express.static(path.join(__dirname, "images")))

app.use("/api/auth", userRoutes)
app.use("/api/sauces", sauceRoutes)


/*** Start serveur */
mongoose.connect(process.env.DBCONNECT, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Database connection OK')
        app.listen(process.env.SERVER_PORT, () => {
            console.log(`This server is running on port ${process.env.SERVER_PORT}. Enjoy !`)
        })
    })
    .catch(() => console.log("Databse connection failed !"));



