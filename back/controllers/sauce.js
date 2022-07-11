/* Import des modules necessaires */
const Sauce = require("../models/sauce")
const fs = require("fs")
const { captureRejections } = require("events")

/**
 * Récupération des sauces
 */
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({error: error}))
}

/**
 * Création de sauce
 */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)

  // Mise en place des datas
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    // Initialisation valeur like-dislike 0
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  })

  // Enregistrement en base
  sauce.save()
    .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
    .catch((error) => res.status(400).json({ error }))
}

/**
 * Récupération d'un sauce
 */
exports.getOneSauce = (req, res, next) => {
    // Recup sauce avec id
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            res.status(200).json(sauce)
        })
        .catch((error) => {res.status(404).json({error: error})})
}

/**
 * Modification d'une sauce
 */
exports.modifySauce = (req, res, next) => {
  
    // Recup sauce avec id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        // Enregistrement ancienne imgUrl (si nouvelle image dans modif)
        const oldUrl = sauce.imageUrl
        // Recuperation du nom de l'image
        const filename = sauce.imageUrl.split("/images/")[1]

        // Suppression si image, dans le dossier local
        if (req.file) {
            fs.unlink(`images/${filename}`, () => {
            const sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${
                    req.file.filename
                }`
            }
            
            Sauce.updateOne({ _id: req.params.id },{ ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                .catch((error) => res.status(400).json({ error }))
            })
        } else {
            const newItem = req.body
            newItem.imageUrl = oldUrl
            // MAJ de la sauce avec données modifiées
            Sauce.updateOne({ _id: req.params.id },{ ...newItem, imageUrl: oldUrl, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Sauce mise à jour!" }))
                .catch((error) => res.status(400).json({ error }))
        }
    })
    .catch((error) => res.status(500).json({ error }))
};

/**
 * Suppression d'une sauce
 */
exports.deleteSauce = (req, res, next) => {
  
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Suppression img sauce
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                // Suppression sauce
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
                .catch((error) => res.status(400).json({ error }))
            })
        })
        .catch((error) => res.status(500).json({ error }))
};



/**
 * Gestion des like des sauces
 * Regle likeDislikeSauce : Like = 1 _ Dislike = -1 _ Pas de vote = 0
 */
// 
exports.likeDislikeSauce = (req, res, next) => {
  
    let likeDislike = parseInt(req.body.like);
 
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
        
        if (likeDislike === 1) { // Si sauce like = 1
            sauce.likes++
            // sauvegarde userId 
            sauce.usersLiked.push(req.body.userId);
            // MAJ de la sauce 
            Sauce.updateOne({ _id: req.params.id },
                {
                    likes: sauce.likes,
                    usersLiked: sauce.usersLiked,
                    _id: req.params.id,
                })
                .then(() => res.status(200).json({ message: "Tu likes ce produit !" }))
                .catch((error) => res.status(400).json({ error }));
           
        } else if (likeDislike === -1) {  // Si sauce dislike = -1
            sauce.dislikes++
            // sauvegarde userId 
            sauce.usersDisliked.push(req.body.userId)
            // MAJ de la sauce 
            Sauce.updateOne({ _id: req.params.id },
                {
                    dislikes: sauce.dislikes,
                    usersDisliked: sauce.usersDisliked,
                    _id: req.params.id,
                })
            .then(() => res.status(200).json({ message: "Tu dislikes ce produit !" }))
            .catch((error) => res.status(400).json({ error }));
        
        } else if (likeDislike === 0) { // verification et remise a zero sauce like et dislike
        
            // si userId est dans usersLiked = user like
            if (sauce.usersLiked.includes(req.body.userId)){
                sauce.likes--

                // userId est retirer du tableau
                const index = sauce.usersLiked.indexOf(req.body.userId)
                sauce.usersLiked.splice(index, 1)
          
                // MAJ de la sauce 
                Sauce.updateOne({ _id: req.params.id },
                    {
                        likes: sauce.likes,
                        usersLiked: sauce.usersLiked,
                        _id: req.params.id,
                    })
                    .then(() =>res.status(200).json({ message: "Tu ne like plus ce produit !" }))
                    .catch((error) => res.status(400).json({ error }))
            
            // si userId est dans usersDisliked = user dislike
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.dislikes--

                // userId est retirer du tableau
                const index = sauce.usersDisliked.indexOf(req.body.userId)
                sauce.usersDisliked.splice(index, 1)
          
                // MAJ de la sauce 
                Sauce.updateOne({ _id: req.params.id },
                    {
                        dislikes: sauce.dislikes,
                        usersDisliked: sauce.usersDisliked,
                        _id: req.params.id,
                    })
                    .then(() => res.status(200).json({ message: "Tu ne dislike plus ce produit !" }))
                    .catch((error) => res.status(400).json({ error }));
            }
        }
    })
    .catch((error) => {res.status(404).json({error: error})})
}