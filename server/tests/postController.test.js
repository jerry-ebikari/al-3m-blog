const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index');
const Post = require('../models/Post');
const User = require('../models/User');

chai.use(chaiHttp);
let token;

before((done) => {
  const userData = {
    email: 'post-test@example.com',
    password: 'password123',
    firstName: "first",
    lastName: "last"
  };

  chai.request(app)
    .post('/auth/register')
    .send(userData)
    .end((err, res) => {
      token = `Bearer ${res.body.token}`
      Post.deleteMany({}).then(() => {
        done();
      });
    });
});

after((done) => {
  Post.deleteMany({}).then(() => {
    User.deleteMany({}).then(() => {
      done();
    })
  });
});

describe('Post Controller', () => {
  describe('POST /post', () => {
    it('should create a new post', (done) => {
      chai.request(app)
        .post('/post')
        .set('Authorization', token)
        .send({
          title: 'Test Post',
          description: 'Test Description',
          body: 'Test Body',
          tags: ['tag1', 'tag2']
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id');
          postId = res.body._id;
          post = res.body;
          done();
        });
    });
  });

  describe('GET /posts', () => {
    before((done) => {
      Post.deleteMany({}).then(() => {
        chai.request(app)
          .post('/post')
          .set('Authorization', token)
          .send({
            title: 'Test Published',
            description: 'Test Description',
            body: 'Test Body',
            tags: ['tag1', 'tag2'],
            state: "PUBLISHED"
          })
          .end(() => {
            done()
          });
        })
    })

    it('should return all published posts', (done) => {
      chai.request(app)
        .get('/post')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.eql(1);
          done();
        });
    });
  });

  describe('GET /posts/for/user', () => {
    before((done) => {
      Post.deleteMany({}).then(() => {
        chai.request(app)
          .post('/post')
          .set('Authorization', token)
          .send({
            title: 'Test Post for User',
            description: 'Test Description',
            body: 'Test Body',
            tags: ['tag1', 'tag2']
          })
          .end(() => {
            done()
          });
      })
    })

    it('should return posts authored by the logged-in user', (done) => {
      chai.request(app)
        .get('/post/for/user')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.eql(1);
          done();
        });
    });
  });

  describe('GET /post/:id', () => {
    let id;
    before((done) => {
      Post.deleteMany({}).then(() => {
        chai.request(app)
          .post('/post')
          .set('Authorization', token)
          .send({
            title: 'Test Post to get by ID',
            description: 'Test Description',
            body: 'Test Body',
            tags: ['tag1', 'tag2']
          })
          .end((err, res) => {
            id = res.body._id
            done()
          });
      })
    })

    it('should return a specific post by ID', (done) => {
      chai.request(app)
        .get(`/post/${id}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id', id);
          done();
        });
    });
  });

  describe('PUT /post/:id', () => {
    let post;
    before((done) => {
      Post.deleteMany({}).then(() => {
        chai.request(app)
          .post('/post')
          .set('Authorization', token)
          .send({
            title: 'Test Post to Update',
            description: 'Test Description',
            body: 'Test Body',
            tags: ['tag1', 'tag2']
          })
          .end((err, res) => {
            post = res.body
            done()
          });
      })
    })
    it('should update an existing post', (done) => {
      chai.request(app)
        .put(`/post/${post._id}`)
        .set('Authorization', token)
        .send({
          ...post,
          title: 'Updated Post Title'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('title', 'Updated Post Title');
          done();
        });
    });
  });

  describe('DELETE /post/:id', () => {
    let id;
    before((done) => {
      Post.deleteMany({}).then(() => {
        chai.request(app)
          .post('/post')
          .set('Authorization', token)
          .send({
            title: 'Test Post to Delete',
            description: 'Test Description',
            body: 'Test Body',
            tags: ['tag1', 'tag2']
          })
          .end((err, res) => {
            id = res.body._id
            done()
          });
      })
    })

    it('should delete an existing post', (done) => {
      chai.request(app)
        .delete(`/post/${id}`)
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message', 'Post deleted');
          done();
        });
    });
  });
});
