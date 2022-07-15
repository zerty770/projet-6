/* Import des modules necessaires */
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

/**
 * Création utilisateur
 */
exports.signup = (req, res, next) => {
    const { email, password } = req.body

    let regPassword = regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/) //special/number/capital

    if (!regPassword.test(password.value)){
        return res.status(400).json({ message: 'mot de passe non securisé veuillez mettre un mot de passe de minimun 6 caractére une majuscule une minuscule des chiffres et un caractere  special '})
    }
    // Validation des données reçues
    if(!email || !password){
        return res.status(400).json({ message: 'Bad email or password'})
    }

    //securisation mot de passe

    // Hashage du mot de passe utilisateur
    bcrypt.hash(req.body.password, parseInt(process.env.BRYPT_SALT_ROUND))
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        })

        // Creation de l'utilisateur
        user.save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  };

/**
 * Connexion utilisateur
 */
exports.login = (req, res, next) => {
    const { email, password } = req.body

    // Validation des données reçues
    if(!email || !password){
        return res.status(400).json({ message: 'Bad email or password'})
    }

    // Verification utilisateur existant
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
            return res.status(401).json({ error: "Utilisateur non trouvé !" });
            }

            // Verification mot de passe utilisateur
            bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                    return res.status(401).json({ error: "Mot de passe incorrect !" });
                    }

                    // Connection valide
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_DURING,
                        }),
                    })
                })
            .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
}