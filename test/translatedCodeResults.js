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
const {compileToJsAndBeautify} = require("../bin/egg.js");


describe("Testing that the translated js code returns the same as the original", function() {
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


  it("testing def.egg", function(done) {
    const filename = 'def';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing if.egg", function(done) {
    const filename = 'if';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing fun.egg", function(done) {
    const filename = 'fun';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing set.egg", function(done) {
    const filename = 'set';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing sum.egg", function(done) {
    const filename = 'sum';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing object.egg", function(done) {
    const filename = 'object';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing while.egg", function(done) {
    const filename = 'while';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

  it("testing array.egg", function(done) {
    const filename = 'array';
    
    const program = fs.readFileSync('test/compileToJS-tests/'+ filename +'.egg', 'utf8');
    eggvm.run(program);    
    const eggOutput = output.map(x => x.toString());
    output = [];

    const jsprogram = compileToJsAndBeautify('test/compileToJS-tests/'+ filename +'.egg');
    eval(jsprogram);
    const jsOutput = output.map(x => x.toString());

    expect(jsOutput).to.deep.equal(eggOutput);
    done();
  });

});