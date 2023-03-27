/**
 * name : middlewares/validator
 * author : Rakesh Kumar   
 * Date : 20-Oct-2021
 * Description : Contains logic to call required validator from validators directory to validate request data
 */
const fs = require('fs')

module.exports = (req, res, next) => {
	try {
		require(`@validators/${req.params.version}/${req.params.controller}`)[req.params.method](req)
	} catch (error) {}
	next()
}
