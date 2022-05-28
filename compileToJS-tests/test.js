const path = require('path');
const runtimeSupport = require(path.join('/home/usuario/TFA/tfa-enrique-vina-alonso-alu0101337760/bin', "..", "lib", "runtime-support"));
var $a, $sum;
(() => {
  $a = 1;
  $sum = function($x) {
    $x = ($x + 1)
  };
  return runtimeSupport.print($sum($a));
})()
