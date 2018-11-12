'use strict'

const expect = require('chai').expect
const index = require('../dist/index.js')

describe('Error creation', () => {
  it('should create simple error', function () {
    const TestError = index.default.defineError('TestError')
    expect(TestError).to.be.a('function')
    expect(TestError.prototype.name).to.be.equal('TestError')

    const error = new TestError('error message')
    expect(error.name).to.be.equal('TestError')
    expect(error.message).to.be.equal('error message')
    expect(error.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError:')
    expect(stackLines[0]).to.have.string('error message')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)

    expect(error.toJSON).to.be.a('function')
    const json = error.toJSON()

    expect(json.stack).to.be.a('array')
    expect(json.stack.join('\n')).to.be.equal(error.stack)
    expect(json.message).to.be.a('string').and.equal('error message')
  })

  it('should create error with formatted message', function () {
    const TestError = index.default.defineError('TestError')
    expect(TestError).to.be.a('function')
    expect(TestError.prototype.name).to.be.equal('TestError')

    const error = new TestError('error message %s %s', 'test1', 'test2')
    expect(error.name).to.be.equal('TestError')
    expect(error.message).to.be.equal('error message test1 test2')
    expect(error.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError:')
    expect(stackLines[0]).to.have.string('error message test1 test2')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)
  })

  it('should create error with data', function () {
    const TestError = index.default.defineError('TestError', {attr1: 'test', attr2: 2})
    expect(TestError).to.be.a('function')
    expect(TestError.prototype.name).to.be.equal('TestError')

    const error = new TestError('error message %s %s', 'test1', 'test2')
    expect(error.name).to.be.equal('TestError')
    expect(error.message).to.be.equal('error message test1 test2')
    expect(error.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError:')
    expect(stackLines[0]).to.have.string('error message test1 test2')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)

    expect(error.attr1).to.be.equal('test')
    expect(error.attr2).to.be.equal(2)
    expect(error.toJSON().attr1).to.be.equal('test')
    expect(error.toJSON().attr2).to.be.equal(2)
  })

  it('should create error with custom constructor', function () {
    const TestError = index.default.defineError('TestError', {attr1: 'test', attr2: 2}, function (message) {
      this.attr3 = 'test3'
      this.attr4 = this.attr1
      this.message = 'custom message ' + this.attr4
    })
    expect(TestError).to.be.a('function')
    expect(TestError.prototype.name).to.be.equal('TestError')

    const error = new TestError('error message %s %s', 'test1', 'test2')
    expect(error.name).to.be.equal('TestError')
    expect(error.message).to.be.equal('custom message test')
    expect(error.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError:')
    expect(stackLines[0]).to.have.string('custom message test')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)

    expect(error.attr1).to.be.equal('test')
    expect(error.attr2).to.be.equal(2)
    expect(error.attr3).to.be.equal('test3')
    expect(error.attr4).to.be.equal('test')
    expect(error.toJSON().attr3).to.be.equal('test3')
    expect(error.toJSON().attr4).to.be.equal('test')
    expect(error.toJSON().message).to.be.equal('custom message test')
  })

  it('should create error inherited from Error', function () {
    const TestError = index.default.defineError('TestError', {attr1: 'test', attr2: 2}, Error)
    expect(TestError).to.be.a('function')
    expect(TestError.prototype.name).to.be.equal('TestError')

    const error = new TestError('error message %s %s', 'test1', 'test2')
    expect(error.name).to.be.equal('TestError')
    expect(error.message).to.be.equal('error message test1 test2')
    expect(error.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError:')
    expect(stackLines[0]).to.have.string('error message test1 test2')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)

    expect(error.attr1).to.be.equal('test')
    expect(error.attr2).to.be.equal(2)
    expect(error.toJSON().attr1).to.be.equal('test')
    expect(error.toJSON().attr2).to.be.equal(2)
  })

  it('should create error inherited from other custom error', function () {
    const TestError = index.default.defineError('TestError', {attr1: 'test', attr2: 2})
    const TestError1 = index.default.defineError('TestError1', {attr3: 'test5', attr2: 4}, TestError)
    const TestError2 = index.default.defineError('TestError2', {attr1: 'test', attr2: 2})
    const TestError3 = index.default.defineError('TestError3', {attr4: 'test6'}, TestError1)

    expect(TestError1).to.be.a('function')
    expect(TestError1.prototype.name).to.be.equal('TestError1')

    const error = new TestError1('error message %s %s', 'test4', 4)
    const error3 = new TestError3('error message %s %s', 'test1', 'test2', error)
    expect(error.name).to.be.equal('TestError1')
    expect(error.message).to.be.equal('error message test4 4')
    expect(error.stack).to.be.a('string')

    expect(error3.name).to.be.equal('TestError3')
    expect(error3.message).to.be.equal('error message test1 test2')
    expect(error3.stack).to.be.a('string')

    const stackLines = error.stack.split('\n')
    expect(stackLines).to.have.lengthOf.above(0)

    expect(stackLines[0]).to.have.string('TestError1:')
    expect(stackLines[0]).to.have.string('error message test4 4')

    const stackLines3 = error3.stack.split('\n')
    expect(stackLines3).to.have.lengthOf.above(0)

    expect(stackLines3[0]).to.have.string('TestError3:')
    expect(stackLines3[0]).to.have.string('error message test1 test2')

    expect(stackLines3).to.contains('TestError1: error message test4 4')

    expect(error).to.be.instanceOf(Error)
    expect(error).to.be.instanceOf(TestError)
    expect(error).to.be.instanceOf(TestError1)
    expect(error).to.not.be.instanceOf(TestError2)

    expect(error.attr1).to.be.equal('test')
    expect(error.attr2).to.be.equal(4)
    expect(error.attr3).to.be.equal('test5')
    expect(error.toJSON().attr1).to.be.equal('test')
    expect(error.toJSON().attr2).to.be.equal(4)

    //Test double inheritance
    expect(error3).to.be.instanceOf(Error)
    expect(error3).to.be.instanceOf(TestError)
    expect(error3).to.be.instanceOf(TestError1)
    expect(error3).to.be.instanceOf(TestError3)
    expect(error3).to.not.be.instanceOf(TestError2)

    expect(error3.attr1).to.be.equal('test')
    expect(error3.attr2).to.be.equal(4)
    expect(error3.attr3).to.be.equal('test5')
    expect(error3.attr4).to.be.equal('test6')
    expect(error3.toJSON().attr1).to.be.equal('test')
    expect(error3.toJSON().attr2).to.be.equal(4)

  })

})