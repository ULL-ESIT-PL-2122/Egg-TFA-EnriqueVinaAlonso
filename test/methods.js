let insp = require("util").inspect;
let ins = (x) => insp(x, {depth:null});
var fs = require('fs');
let should = require('should');
let sinon = require('sinon');
let testConsole = require("test-console");
let expect = require('chai').expect;
require('mocha-sinon');

const assert = require('assert');
const {Value, Word, Apply} = require("../lib/ast.js");

var eggvm = require('../lib/eggvm.js');


describe("Calling JS Methods from Egg", function() {
  let originalLog;
  let output = [];
  beforeEach(function() {
    originalLog = console.log;
    console.log = function (...args) { 
      originalLog(...args); 
      output.push(...args);
      return args; 
    };
  });

  // test code here
  afterEach(function() {
    console.log = originalLog;
    output = [];
  });

  it("testing method.egg", function(done) {
    const filename = 'method';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });

  it("testing method2.egg", function(done) {
    const filename = 'method2';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });


  it("testing method3.egg", function(done) {
    const filename = 'method3';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });


  it("testing method-concatenation.egg", function(done) {
    const filename = 'method-concatenation';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });

});
