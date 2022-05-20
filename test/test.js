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


describe("run", function() {
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

  it("should run a complex function", function() {
    let program = `do(
  def(sum,  # function
    ->(nums, 
      do(
         def(i, 0), # Creates a local variable i and sets to 0
         def(s, 0), # Creates local var s and sets to 0
         while(<(i, length(nums)),
           do(=(s, +(s, <-(nums, i))),
              =(i, +(i, 1))
           )
         ),
         s # the last expression is returned 
      )
   )
 ),
 sum(array(1, 2, 3, 4))
)
    `;
    let r = eggvm.run(program);
    r.should.eql(10);
  });

  it("testing one.egg with mocking of console.log", function() {
    const program = fs.readFileSync('test/examples/one.egg', 'utf8');
    const r = eggvm.run(program);
    r.should.eql(50);
  });

  it("testing array.egg with mocking of console.log", function() {
    let program = fs.readFileSync('examples/array.egg', 'utf8');
    let r = eggvm.run(program);
    r.should.eql(5);
    output.should.be.deepEqual([ "[1,4]" , "5" ]);
    //console.log(output);
  });

  it("testing if.egg with mocking of console.log", function() {
    let program = fs.readFileSync('examples/if.egg', 'utf8');
    let r = eggvm.run(program);
    r.should.eql(5);
    output.should.be.deepEqual([ '5' ]);
    //console.log(output);
  });

  it("testing reduce.egg with mocking of console.log", function() {
    let program = fs.readFileSync('test/examples/reduce.egg', 'utf8');
    let r = eggvm.run(program);
    r.should.eql(1);
    output.should.be.deepEqual([ '15', '720', '0', '1' ]);
    //console.log(output);
  });

});
