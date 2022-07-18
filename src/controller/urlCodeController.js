const urlCodeModel = require('../model/urlCodeModel');
const validUrl = require('valid-url');
const shortUrl = require('node-url-shortener');

// shortUrl.short( function (err, url) );

const createUrlCode = async function(req,res){
        try{
            let data = req.body;
            const {longUrl} = data;

            let saveddata = await urlCodeModel.create(data);
            res.status(201).send({status: true, data: saveddata})
            
            
           
   
        }catch(error){
            res.status(500).send({status: false, error: error.message})
        }
        
}

module.exports = {createUrlCode}