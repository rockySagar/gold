const mongoose = require('mongoose')
const mock = require('./mock')

async function loadMongo() {
	let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	global.db = db
	return
}

let mockData = require('./mock')

describe('Sessions controller and helper test', () => {
	afterEach(() => {
		loadMongo()
	})

	let controller
	let accountService
	let userModel

	beforeAll(async () => {
		await loadMongo()
		accountService = require('@services/helper/account')
		controller = require('@controllers/v1/account')
		userModel = require('@db/users/queries')
		return
	})

	test('add user', async () => {
		let user = await userModel.createUser(mock.userData)
		expect(user).toBe(true)
	})

	test('login api check', async () => {
		const request = {
			body: { email: 'example@mail.com', password: 'Okok@123' },
			pageNo: 1,
			pageSize: 10,
			query: { type: 'mentor' },
		}

		let list = await accountService.list(request)
		expect(list.statusCode).toBe(200)
		expect(list.responseCode).toBe('OK')
		expect(list.result.count).toBe(1)
	})

	afterAll(async () => {
		try {
			mongoose.connection.close()
		} catch (error) {
			console.log(`
            You did something wrong
            ${error}
          `)
			throw error
		}
	})
})
