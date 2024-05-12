const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index');
const User = require('../models/User');

chai.use(chaiHttp);

before((done) => {
    User.deleteMany({}).then(() => {
        done();
    });
})

after((done) => {
    User.deleteMany({}).then(() => {
        done();
    });
})

describe('Authentication Controller', () => {
    describe('POST /auth/register', () => {

        it('should register a new user', (done) => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: "first",
                lastName: "last"
            };

            chai.request(app)
                .post('/auth/register')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.not.have.property('password');
                    expect(res.body).to.have.property('token');
                    done();
                });
        });

        it('should throw an error if email is already in use', (done) => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: "first",
                lastName: "last"
            };

            chai.request(app)
                .post('/auth/register')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(409);
                    expect(res.body.message).to.equal('Email is already in use.');
                    done();
                });
        });

        it('should throw an error if password is less than 6 characters', (done) => {
            const userData = {
                email: 'test2@example.com',
                password: 'pass',
                firstName: "first",
                lastName: "last"
            };
            const res = chai.request(app)
                .post('/auth/register')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Password must contain at least 6 characters.');
                    done();
                });

        });
    });

    describe('POST /auth/login', () => {

        it('should login a user', (done) => {
            const userData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const res = chai.request(app)
                .post('/auth/login')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.not.have.property('password');
                    expect(res.body).to.have.property('token');
                    done();
                });

        });

        it('should throw an error if user does not exist', (done) => {
            const userData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };
            const res = chai.request(app)
                .post('/auth/login')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Invalid credentials');
                    done();
                });
        });

        it('should throw an error if password is incorrect', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password'
            };
            const res = chai.request(app)
                .post('/auth/login')
                .send(userData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('Invalid credentials');
                    done();
                });
        });
    });
});
