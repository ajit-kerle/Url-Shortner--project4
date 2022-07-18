const shortid = require("shortid");
const urlCodeModel = require("../model/urlCodeModel");

const createUrlCode = async (req, res) => {
  try {
        let data = req.body;
    let longUrl = data.longUrl;
    if (Object.keys(data).length == 0)  return res.status(400).send({ status: false, message: "Enter a valid input in body" });

    //  Validation for longUrl is valid or not.
    if (!longUrl)  return res.status(400).send({ status: false, message: "Enter a valid longUrl" });

    // using regex for checking  that longUrl is in valid format or not.
    if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(longUrl) )
      return res.status(400).send({ status: false, message: `'${longUrl}' is not a valid URL` });

    //creating urlCode              
    let shortId = shortid.generate().toLowerCase();

    // //checking if urlCode is unique and has only lower case letters
    // if (!/^[a-z]+$/.test(shortId))  return res.status(400).send({ status: false, message: `'${shortId}' is not a valid URL` });
    
    data.urlCode = shortId;
    data.shortUrl = "localhost:3000/" + shortId;


    let savedData = await urlCodeModel.create(req.body);

    let data1 = {
      longUrl: savedData.longUrl,
      shortUrl: savedData.shortUrl,
      urlCode: savedData.urlCode,
    };
                     
    res.status(201).send({ status: true, data: data1 });
  } catch (err) {
    res.status(500).send({ sattus: false, message: err.message });
  }
};

const getUrlCode = async function(req,res){
    try{
    let urlCode = req.params.urlCode;
    if(!urlCode) return res.status(400).send({status: false, msg: "write valid url in params"});
    let findUrl = await urlCodeModel.findOne({urlCode: urlCode});
    if(!findUrl) return res.status(404).send({status: false, msg: "url not found"});
    res.status(302).redirect(findUrl.longUrl)
    }catch(err){
        res.status(500).send({status: false, error: err.message})
    }
}
module.exports = {createUrlCode,getUrlCode}