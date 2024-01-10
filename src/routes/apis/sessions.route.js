const {Router} = require('express')

const router = Router()

//sessions
router.get('/', (req, res) => {

})

//cookies
router.post('/setcookies', (req, res) => {})
router.get('/getcookies', (req, res) => {})
router.delete('/deletecookies', (req, res) => {})

exports.sessionRouter = router;