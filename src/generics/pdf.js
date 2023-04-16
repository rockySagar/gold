/**
 * name : generics/pdf
 * author : Rakesh Kumar
 */

var pdf = require('html-pdf')

const generatePdf = (html, options) => {
	return new Promise(async (resolve, reject) => {
		// //  options['format'] ='Letter';
		// //  options['width'] ='200px';
		// var options =
		pdf.create(html, options).toBuffer(function (err, buffer) {
			if (err) return console.log(err)
			resolve(buffer)
		})
	})
}

module.exports = {
	generatePdf,
}
