const express = require('express')

const router = express.Router()

// wiki路由
router.get('/:id', (req, res) => {
    console.log('------wiki------');
    console.log(req.params);
    res.send('维基主页');
});

module.exports = router;
