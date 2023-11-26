/**
 * name : utils.js
 * author : Rakesh
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')
const { AwsFileHelper, GcpFileHelper, AzureFileHelper } = require('files-cloud-storage')

const S3 = require('aws-sdk/clients/s3')

const s3 = new S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	signatureVersion: 'v4',
	region: process.env.AWS_BUCKET_REGION,
})

const generateToken = (tokenData, secretKey, expiresIn) => {
	return jwt.sign(tokenData, secretKey, { expiresIn })
}

const hashPassword = (password) => {
	const salt = bcryptJs.genSaltSync(10)
	let hashPassword = bcryptJs.hashSync(password, salt)
	return hashPassword
}

const comparePassword = (password1, password2) => {
	return bcryptJs.compareSync(password1, password2)
}

const clearFile = (filePath) => {
	fs.unlink(filePath, (err) => {
		if (err) console.log(err)
	})
}

const composeEmailBody = (body, params) => {
	return body.replace(/{([^{}]*)}/g, (a, b) => {
		var r = params[b]
		return typeof r === 'string' || typeof r === 'number' ? r : a
	})
}

const getDownloadableUrl = async (imgPath) => {
	if (process.env.CLOUD_STORAGE === 'GCP') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_GCP_BUCKET_NAME,
			gcpProjectId: process.env.GCP_PROJECT_ID,
			gcpJsonFilePath: path.join(__dirname, '../', process.env.GCP_PATH),
		}
		imgPath = await GcpFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'AWS') {
		// const options = {
		// 	destFilePath: imgPath,
		// 	bucketName: process.env.DEFAULT_AWS_BUCKET_NAME,
		// 	bucketRegion: process.env.AWS_BUCKET_REGION,
		// }
		// imgPath = await AwsFileHelper.getDownloadableUrl(options.destFilePath, options.bucketName, options.bucketRegion)

		/* Signed url options */
		let options = {
			Bucket: process.env.DEFAULT_AWS_BUCKET_NAME,
			Key: imgPath,
			Expires: 600000,
		}
		options = JSON.parse(JSON.stringify(options))

		try {
			/* connected to bucket and instantiated file object to get signed url */
			const signedUrl = await s3.getSignedUrlPromise('getObject', options)
			// return { signedUrl, filePath: destFilePath };
			imgPath = signedUrl
		} catch (error) {
			throw error
		}
	} else if (process.env.CLOUD_STORAGE === 'AZURE') {
		const options = {
			destFilePath: imgPath,
			containerName: process.env.DEFAULT_AZURE_CONTAINER_NAME,
			expiry: 30,
			actionType: 'rw',
			accountName: process.env.AZURE_ACCOUNT_NAME,
			accountKey: process.env.AZURE_ACCOUNT_KEY,
		}
		imgPath = await AzureFileHelper.getDownloadableUrl(options)
	}
	return imgPath
}

const calculateInterest = (prinicple, rateOfIntrest, days) => {
	let interest = Math.ceil((prinicple * rateOfIntrest * (days / 365)) / 100)
	return interest
}

module.exports = {
	generateToken,
	hashPassword,
	comparePassword,
	clearFile,
	composeEmailBody,
	getDownloadableUrl,
	calculateInterest,
}
