/**
 * name : configs
 * author : Rakesh Kumar   
 * Date : 31-Sep-2021
 * Description : Contains connections of all configs
 */

//Dependencies
require('./mongodb')()
// require('./kafka')()
const path = require('path')




global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, '..')
