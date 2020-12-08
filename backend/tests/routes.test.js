var request = require('supertest');
var server = require('../index');
var agent = request.agent('localhost:3001');
var database = require('../database');

//Globals that keep track of database item id's
let post1_id;

//Drop the database so we start with a clean slate
database.dropDatabase();

describe('Sessions', function() {
	it('Nonexistent route', function(done) {
		agent.get('/api/activity/void' + post1_id)
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			done();
		});
	});
	it('Register account', function(done) {
		agent.post('/api/auth/register')
		.send({ username: 'AzureDiamond', password: 'hunter2', email: 'test@test.com' })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			done();
		});
	});
	it('Log into registered account', function(done) {
		agent.post('/api/auth/login')
		.send({ username: 'AzureDiamond', password: 'hunter2' })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			done();
		});
	});
	it('Create activity', function(done) {
		agent.post('/api/activity/create')
		.send({ title: 'testtitle', description: 'testdescription' })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('testtitle');
			expect(res.body.activity.description).toEqual('testdescription');
			post1_id = res.body.activity._id;
			done();
		});
	});
	it('Create blank activity', function(done) {
		agent.post('/api/activity/create')
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('Unnamed activity');
			expect(res.body.activity.description).toEqual('No description offered');
			done();
		});
	});
	it('Check created activity', function(done) {
		agent.get('/api/activity/' + post1_id)
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('testtitle');
			expect(res.body.activity.description).toEqual('testdescription');
			done();
		});
	});
	it('Check nonexistent activity', function(done) {
		agent.get('/api/activity/' + 'aaaaaaaaaaaaaaaaaaaaaaaa')
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			expect(res.body.error).toEqual('Not found');
			done();
		});
	});
	it('Check invalid activity', function(done) {
		agent.get('/api/activity/' + 'aaa')
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(500);
			expect(res.body.error).toEqual('Error retrieving from database');
			done();
		});
	});
	it('Edit activity', function(done) {
		agent.post('/api/activity/edit/' + post1_id)
		.send({ title: 'newtitle', description: 'newdescription' })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('newtitle');
			expect(res.body.activity.description).toEqual('newdescription');
			done();
		});
	});
	it('Check edited activity', function(done) {
		agent.get('/api/activity/' + post1_id)
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('newtitle');
			expect(res.body.activity.description).toEqual('newdescription');
			done();
		});
	});
	it('Delete activity', function(done) {
		agent.post('/api/activity/delete/' + post1_id)
		.send()
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			done();
		});
	});
	it('Check deleted activity', function(done) {
		agent.get('/api/activity/' + post1_id)
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			expect(res.body.error).toEqual('Deleted');
			done();
		});
	});
	it('Restore activity', function(done) {
		agent.post('/api/activity/restore/' + post1_id)
		.send()
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			done();
		});
	});
	it('Check restored activity', function(done) {
		agent.get('/api/activity/' + post1_id)
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('newtitle');
			expect(res.body.activity.description).toEqual('newdescription');
			done();
		});
	});
	it('Edit nonexistent activity', function(done) {
		agent.post('/api/activity/edit/' + 'aaaaaaaaaaaaaaaaaaaaaaaa')
		.send({ title: 'newtitle', description: 'newdescription' })
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			expect(res.body.error).toEqual('Not found');
			done();
		});
	});
	it('Delete nonexistent activity', function(done) {
		agent.post('/api/activity/delete/' + 'aaaaaaaaaaaaaaaaaaaaaaaa')
		.send({ title: 'newtitle', description: 'newdescription' })
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			expect(res.body.error).toEqual('Not found');
			done();
		});
	});
	it('Restore nonexistent activity', function(done) {
		agent.post('/api/activity/restore/' + 'aaaaaaaaaaaaaaaaaaaaaaaa')
		.send({ title: 'newtitle', description: 'newdescription' })
		.end(function(err, res) {
			expect(res.status).toEqual(404);
			expect(res.body.error).toEqual('Not found');
			done();
		});
	});
	it('Simple search', function(done) {
		agent.get('/api/activity/search')
		.send({})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.results.length).toEqual(2);
			done();
		});
	});
	it('Create activity with dates; ongoing', function(done) {
		agent.post('/api/activity/create')
		.send({ title: 'testtitle', description: 'testdescription', startDateTime: 1})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('testtitle');
			expect(res.body.activity.description).toEqual('testdescription');
			let startDateTime = new Date(res.body.activity.startDateTime);
			expect(startDateTime.getTime()).toEqual(1);
			done();
		});
	});
	it('Create activity with dates; ended', function(done) {
		agent.post('/api/activity/create')
		.send({ title: 'testtitle', description: 'testdescription', startDateTime: 1, endDateTime: 2})
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.activity.title).toEqual('testtitle');
			expect(res.body.activity.description).toEqual('testdescription');
			let startDateTime = new Date(res.body.activity.startDateTime);
			let endDateTime = new Date(res.body.activity.endDateTime);
			expect(startDateTime.getTime()).toEqual(1);
			expect(endDateTime.getTime()).toEqual(2);
			done();
		});
	});
	it('Create activity with invalid dates', function(done) {
		agent.post('/api/activity/create')
		.send({ title: 'testtitle', description: 'testdescription', startDateTime: 3, endDateTime: 2 })
		.end(function(err, res) {
			expect(res.status).toEqual(400);
			expect(res.body.error).toEqual('endDateTime is less than startDateTime');
			done();
		});
	});
	it('Search omit ended', function(done) {
		agent.get('/api/activity/search')
		.send({ omitEnded:true })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.results.length).toEqual(3);
			done();
		});
	});
	it('Search omit started', function(done) {
		agent.get('/api/activity/search')
		.send({ omitStarted:true })
		.end(function(err, res) {
			expect(res.status).toEqual(200);
			expect(res.body.results.length).toEqual(2);
			done();
		});
	});
});




