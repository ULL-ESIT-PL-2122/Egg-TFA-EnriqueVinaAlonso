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


describe("Testing Egg classes", function() {
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

  it("testing class.egg", function(done) {
    const filename = 'class';
    
    const program = fs.readFileSync('test/class-tests/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/class-tests/'+ filename +'.eggpected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });

});