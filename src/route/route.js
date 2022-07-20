const express = require('express');
const router = express.Router();

const  {createUrlCode, fetchUrlGetCode} = require("../controller/urlCodeController")

router.post('/url/shorten',createUrlCode)  
router.get('/:urlCode',fetchUrlGetCode)

module.exports = router; 

