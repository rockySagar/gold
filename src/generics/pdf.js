/**
 * name : generics/pdf
 * author : Rakesh Kumar
 */

var pdf = require('html-pdf')

const generatePdf = (html) => {
	return new Promise(async (resolve, reject) => {
		var options = { format: 'Letter' }
		pdf.create(html, options).toBuffer(function (err, buffer) {
			if (err) return console.log(err)
			resolve(buffer)
		})
	})
}

module.exports = {
	generatePdf,
}
