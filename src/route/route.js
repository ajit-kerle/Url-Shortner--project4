const express = require('express');
const router = express.Router();

const  {createUrlCode,getUrlCode} = require("../controller/urlCodeController")

router.post('/url/shorten',createUrlCode)  
router.get('/:urlCode',getUrlCode)
module.exports = router; 

