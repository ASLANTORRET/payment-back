'use strict';
const bcrypt = require('bcrypt');
const fs = require('fs')
const LOGO_LOCATION = 'img/logo/'

module.exports.getProviders = (req, res) => {
    const Merchants =  db_sequelize.sequelize.models.merchant;
    Merchants.findAll({ raw: true }).then(merchants => {
        console.log("merchants: ", merchants);
        return res.json({ status: 'success', body: merchants });
    })
    .catch((error) => {
        return res.json({ status: 'error', error });
    });
};

module.exports.providerById = (req, res) => {
    const Merchants =  db_sequelize.sequelize.models.merchant;
    const { merchantid } = req.query
    if(merchantid){
        Merchants.findOne({ where: { merchantId: merchantid }})
        .then(merchant => {
            return res.json({ status: 'success', body: merchant });
        })
        .catch(error => {
            return res.status(400).json({status: 'error', error})      
        });
    }
    return res.status(400).json({status: 'error', error: 'Некорректный запрос'})
};
module.exports.addProvider = (req, res) => {
    const {  
            internalName,             
            displayName, 
            description, 
            category} = req.body

    console.log('request: ', req)
    const { mimetype } = req.file
    const imagePath = "public/" + LOGO_LOCATION + Date.now() + '.' +  mimetype.split("/")[1];
    const image = req.headers.host + "/stat/" + LOGO_LOCATION + Date.now() + '.' +  mimetype.split("/")[1];
    fs.rename(req.file.path, imagePath, err => {
      fs.unlink(req.file.path, (err) => {if(err) console.log(err)});   // remove from uploads folder
      if (err) {
        console.log(err);
        return res.status(500).json({status: 'error', error:"Ошибка сохранения изображения"})            
      } else {
            const Merchants =  db_sequelize.sequelize.models.merchant;            
            Merchants.findOrCreate({
                where: { internalName },
                defaults: {
                    internalName,
                    fullName: internalName,
                    displayName,
                    description,
                    endMerchantName: internalName,
                    status: 'ACTIVE',
                    startDate: '2017-05-05 00:00:00',
                    endDate: '2057-05-04 00:00:00',
                    category,
                    image
                }}
            )
            .then(merchant => {
                console.log('create succeed', merchant)
                return res.status(200).json({status: 'success', body: merchant})            
        
            })
            .catch(error => {
                console.log('create failed', error)
                return res.status(400).json({status: 'error', error})    
            });
        }
    });
    
    

    // Merchants.
}
module.exports.editProvider = (req, res) => {
    const { id } = req.body;
    if(!id){
        return res.status(400).json({ status: 'error', body: 'Некорректный запрос'});
    }
    const Merchants =  db_sequelize.sequelize.models.merchant;
    Merchants.findOne({
        where: {id}})
    .then(merchant => {        
        const { mimetype } = req.file
        const image =   req.headers.host = "/stat/" + LOGO_LOCATION + Date.now() + '.' +  mimetype.split("/")[1];
        const imagePath = "public/" + LOGO_LOCATION + Date.now() + '.' +  mimetype.split("/")[1];
        fs.rename(req.file.path, imagePath, err => {
            fs.unlink(req.file.path, (err) => {if(err) console.log(err)});   // remove from uploads folder      
            if (err) {
                console.log(err);
                return res.status(500).json({status: 'error', error:"Ошибка сохранения изображения при изменении"})            
            } 
            else{
                const { internalName,             
                    displayName, 
                    description, 
                    category} = req.body;

                merchant.internalName = internalName;
                merchant.displayName = displayName;
                merchant.fullName = internalName;
                merchant.description = description;
                merchant.endMerchantName = internalName;
                merchant.category = category;
                merchant.image = image;
                merchant.save();
                return res.json({ status: 'success', body: merchant });
            }    
        })
    })
    .catch(error => {
        console.log("error: ", error)
        return res.status(500).json({ status: 'error', error });
    })
}
module.exports.getContainers = (req, res) => {
    const Containers =  db_sequelize.sequelize.models.container;
    const Merchants =  db_sequelize.sequelize.models.merchant;
    Containers.findAll({ raw: true, include:[Merchants] }).then(containers => {
        console.log("containers: ", containers);
        return res.json({ status: 'success', body: containers });
    })
    .catch((error) => {
        return res.json({ status: 'error', error });
    });
}
module.exports.addContainer = (req, res) => {
    const {  
        internalName,             
        displayName, 
        description, 
        merchants} = req.body
        
}
module.exports.getRegions = (req, res) => {
    const Regions =  allRegionssd;
    console.log('regions:', Regions);
    return res.json({ status: 'success', body: Regions });
};

module.exports.signin = (req, res) => {
   const AdminUser = db_sequelize.sequelize.models.admin_user; 
   const { email, password } = req.body;  
   console.log("body: ", req.body)
   if(email){
        AdminUser.findOne({ where: { email } })
        .then(user => {
            console.log("found: ", user)
            if(user){
                bcrypt.compare(password, user.password).then(result => {
                    if(result){
                        console.log("matched: ", result)
                        return res.status(200).json({status: 'success', body: user})
                    }
                    else{
                        console.log("match error: ", result)
                        return res.status(404).json({status: 'error', error: 'Пользователь не найден. Попробуйте еще раз'})           
                    }
                })   
            }
            else{
                return res.status(404).json({status: 'error', error: 'Пользователь не найден. Попробуйте еще раз'})    
            }
        })
        .catch(error => {
            return res.status(500).json({status: 'error', error})    
        });    
    }    
};


