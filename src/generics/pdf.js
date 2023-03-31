/**
 * name : generics/pdf
 * author : Rakesh Kumar
 */

var html_to_pdf = require('html-pdf-node')
var pdf = require('html-pdf')

const generatePdf2 = (html) => {
	return new Promise(async (resolve, reject) => {
		let file = { content: html }

		let options = { format: 'A4', path: 'new.pdf' }
		//  let file = { url: "https://example.com" };
		let data = await html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
			// console.log("PDF Buffer:-", pdfBuffer);

			resolve(pdfBuffer)
		})
	})
}
const generatePdf = (html) => {
	return new Promise(async (resolve, reject) => {
		var options = { format: 'Letter' }
		pdf.create(html, options).toFile('new.pdf', function (err, res) {
			if (err) return console.log(err)
			console.log(res) // { filename: '/app/businesscard.pdf' }
			resolve(res)
		})
	})
}

module.exports = {
	generatePdf,
}
