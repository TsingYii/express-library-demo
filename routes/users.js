var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('<h1>respond</h1> with a resource');
});

router.get('/cool', function(req, res, next) {
  res.send('你好酷');
});

module.exports = router;
