const urlCodeModel = require('../model/urlCodeModel');
const validUrl = require('valid-url');
const shortid = require('shortid')
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    19578,
    "redis-19578.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("UNSTAO7qZDziCHbhZjHpE93W2yArYf1w", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



// ===================<<<<<<<<<<<< validation >>>>>>>>>>>>>>>=====================================
const isValidUrl = (url) => {
    if (/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url.trim()))
        return true
    else
        return false
}

const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return false
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true
}


const createUrlCode = async function (req, res) {
    try {
        let data = req.body;
        let { longUrl } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" })
        } else {

            if (isValidUrl(longUrl) && isValid(longUrl)) {
                let baseUrl = "http://localhost:3000"

                const urlCreation = shortid.generate() // here we are creating short url code
                const urlCode = urlCreation.trim().toLowerCase() // we are triming here

                let shortUrl = baseUrl + "/" + urlCode // concatinating short url here

                data["shortUrl"] = shortUrl // adding prop in data object
                data["urlCode"] = urlCode // adding prop in data object


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




const fetchUrlGetCode = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        console.log(urlCode.length>=7 && urlCode.length<=14)
        if(!(urlCode.length>=7 && urlCode.length<=14)){
            return res.status(400).send({ status: false, msg: 'url code is not valid ' })
        }
        // if (!shortid.isValid(urlCode)) {
        //     return res.status(400).send({ status: false, msg: 'url code is not valid' })
        // }

        let cahcedCode = await GET_ASYNC(`${urlCode}`)
        if (cahcedCode) {
            res.send(cahcedCode)
        } else {
            let urlCodeData = await urlCodeModel.findOne({ urlCode:urlCode},{ urlCode: 1, shortUrl: 1, longUrl: 1, _id: 0 });
            if(!urlCodeData){
                return res.status(404).send({ status: false, message:"urlcode is not found"  })
            }
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlCodeData))
            return res.status(200).send({ status: true, data: urlCodeData })
        }
    } catch (err) {
        res.status(500).send({ status: false, error: error.message })
    }

};

module.exports = { createUrlCode, isValid, isValidUrl, fetchUrlGetCode }