const shortid = require("shortid");
const urlCodeModel = require("../model/urlCodeModel");
const redis = require("redis");

const { promisify } = require("util");         

//Connect to redis
const redisClient = redis.createClient(
  14674,
  "redis-14674.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("L0heTOscTdBVNsqnedJYGXuP83MEXWHx", function (err) {
  if (err) throw err;
});        
redisClient.on("connect", async function () {
  console.log("Connected to Redis..");        
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const createUrlCode = async function(req, res){                   
  try {
        let data = req.body;
    let longUrl = data.longUrl;
    if (Object.keys(data).length == 0)  return res.status(400).send({ status: false, message: "Enter a valid input in body" });
    if (!longUrl)  return res.status(400).send({ status: false, message: "Enter a valid longUrl" });
    if (!/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})?$/.test(longUrl) )
    return res.status(400).send({ status: false, message: `'${longUrl}' is not a valid URL` });                      
    let cachedData = await GET_ASYNC(`${longUrl}`)  
    if(cachedData) return res.status(200).send({status: true,msg:"It is already present",data: JSON.parse(cachedData)});
       let longUrlExist = await urlCodeModel.findOne({longUrl:longUrl}).select({longUrl:1,shortUrl:1,urlCode:1,_id:0});
       if(longUrlExist){
       await SET_ASYNC(`${longUrl}`,60,JSON.stringify(longUrlExist))
        return res.status(200).send({ status: true, data: longUrlExist })
       }
    //  Validation for longUrl is valid or not.

    // using regex for checking  that longUrl is in valid format or not.

    //creating urlCode              
    let shortId = shortid.generate().toLowerCase(); 
    let shortidExist = await urlCodeModel.findOne({urlCode: shortId})
    if(shortidExist) return res.status(200).send({status: true, data:shortidExist})
    // //checking if urlCode is unique and has only lower case letters 
    data.urlCode = shortId;
    data.shortUrl = "http://localhost:3000/" + shortId;                  


    let savedData = await urlCodeModel.create(data);

    let data1 = {
      longUrl: savedData.longUrl,
      shortUrl: savedData.shortUrl,
      urlCode: savedData.urlCode, 
    };
          
    await SET_ASYNC(`${longUrl}`,60,JSON.stringify(data1))
    res.status(201).send({ status: true, data: data1 });
  } catch (err) {
    res.status(500).send({ sattus: false, message: err.message });   
  }
};

const getUrlCode = async function(req,res){    
    try{
      let urlCode = req.params.urlCode;
      if(!shortid.isValid(urlCode)) return res.status(400).send({status:false,msg:"invalid urlCode"})
      let cacheUrl =await GET_ASYNC(`${urlCode}`);
      if(cacheUrl)  return res.status(302).redirect(`${cacheUrl}`);  
     let findUrl = await urlCodeModel.findOne({urlCode: urlCode});
     if(!findUrl) return res.status(404).send({status: false, msg: "url not found"});
    // res.status(302).send({status: true, data: {longUrl:findUrl.longUrl}})
    await SET_ASYNC(`${urlCode}`,60, findUrl.longUrl)    
     res.status(302).redirect( findUrl.longUrl);
    }catch(err){
        res.status(500).send({status: false, error: err.message})       
    }
}        
module.exports = {createUrlCode,getUrlCode}