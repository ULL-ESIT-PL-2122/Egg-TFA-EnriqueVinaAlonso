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


describe("Testing curry functions", function() {
  let originalLog;
  let output = [];
  beforeEach(function() {
    originalLog = console.log;
    console.log = function (...args) { 
      output.push(...args);
      return args; 
    };
  });

  // test code here
  afterEach(function() {
    console.log = originalLog;
    output = [];
  });


  it("testing curry-method.egg", function(done) {
    const filename = 'curry-method';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });

  it("testing curry-no-method.egg", function(done) {
    const filename = 'curry-no-method';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });

  it("testing curry-no-method-cylinder-volume.egg", function(done) {
    const filename = 'curry-no-method-cylinder-volume';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });


});
