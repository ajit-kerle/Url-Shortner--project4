const urlCodeModel = require('../model/urlCodeModel');
const validUrl = require('valid-url');
const shortid = require('shortid')

const createUrlCode = async function(req,res){
        try{
            let data = req.body;
            if (Object.keys(data).length==0) return res.status(400).send({status: false, data: "Body can not be empty"})

            let shortener = await urlCodeModel.create(data);
            let result = {
                longUrl: shortener.longUrl,
                shortUrl: shortener.shortUrl,
                urlCode: shortener.urlCode
            }
           return res.status(201).send({status: true, data: result})

        }catch(error){
            res.status(500).send({status: false, error: error.message})
        }
        
}

module.exports = {createUrlCode}