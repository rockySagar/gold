/**
 * name : generics/pdf
 * author : Rakesh Kumar
 */

 var html_to_pdf = require('html-pdf-node');


const generatePdf = (html) => {
	return new Promise(async (resolve, reject) => {

        let file = { content: html };

        let options = { format: 'A4',path:"new.pdf" };
        //  let file = { url: "https://example.com" };
        let data = await html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
        // console.log("PDF Buffer:-", pdfBuffer);

        resolve(pdfBuffer);
        });
       
        

	})

    
}

module.exports = {
	generatePdf,
}
