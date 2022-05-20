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


describe("Testing eval and state meta properties from Egg", function() {
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


  it("testing specialform-property.egg", function(done) {
    const filename = 'curry-method';
    
    const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
    const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
    const r = eggvm.run(program);    
    output.should.be.deepEqual(expected);
    done();
  });



  for(let i=2; i<=4; i++) {
    it(`testing specialform-property-${i}.egg`, function(done) {
      const filename = `specialform-property-${i}`;
      
      const program = fs.readFileSync('test/examples/'+ filename +'.egg', 'utf8');
      const expected = fs.readFileSync('test/examples/'+ filename +'.egg.expected', 'utf-8').split("\n");
      const r = eggvm.run(program);    
      output.should.be.deepEqual(expected);
      done();
    });
  }

});
