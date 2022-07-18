const urlCodeModel = require('../model/urlCodeModel');
const validUrl = require('valid-url');
const shortid = require('shortid')

const isValidUrl = (url) => {
    if (/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url.trim()))
        return true
    else
        return false
}

const isValid=(value)=>{
    if(typeof  value ==="undefined" || typeof value ==="null") return false
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true
}


const createUrlCode = async function (req, res) {
    try {
        let data = req.body;
        let {longUrl}=data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" })
        } else {

            if (isValidUrl(longUrl) && isValid(longUrl)) {
                let baseUrl="http://localhost:3000" 

                const urlCreation = shortid.generate() // here we are creating short url code
                const urlCode = urlCreation.trim().toLowerCase() // we are triming here
                
                let shortUrl=baseUrl+"/"+urlCode // concatinating short url here

                data["shortUrl"]=shortUrl // adding prop in data object
                data["urlCode"]=urlCode // adding prop in data object
                  
                
                let urlShortData = await urlCodeModel.create(data);
            
                return res.status(201).send({ status: true, data: urlShortData })
            } else {
            return res.status(400).send({ status: false, message: "Pliz provide valid and long url format" })
            }
        }

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

const getUrlCode=async function(req,res){
    try{
        let urlCode=req.params.urlCode

        if (!shortid.isValid(urlCode)) {
            return res.status(400).send({ status: false, msg: 'url code is not valid' })
        }else{
        const urlData = await urlCodeModel.findOne({ urlCode: urlCode },{urlCode:1,shortUrl:1,longUrl:1,_id:0})
        return res.status(201).send({ status: true, data: urlData })
        }
    }catch{
    res.status(500).send({ status: false, error: error.message })
    }
}
module.exports = { createUrlCode,isValid,isValidUrl , getUrlCode}