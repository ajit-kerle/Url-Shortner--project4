const express = require('express');
const router = express.Router();

const  {createUrlCode,getUrlCode} = require("../controller/urlCodeController")

router.post('/url/shorten',createUrlCode)  
router.get('/:urlCode',getUrlCode)

router.all('/**',function(req,res){
    res.status(404).send({status: false, msg: "write valid url"})
})


module.exports = router; 

