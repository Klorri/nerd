/*
	Copyright (c) 2021 NerdLang - Adrien THIERRY and contributors

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

*/
var fs = require("fs");
var path = require("path");



var execFlashArduino = function(from, to, model, driver, bauds, verb)
{
  var spawn = require("child_process").spawn;
  var _flash = spawn("avrdude", ["-p", model, "-c", driver, "-P", to, "-b", bauds, "-F", "-U", "flash:w:"+from]);

  _flash.stdout.on("data", function(data)
  {
    if(verb) process.stdout.write(data.toString());
  });

  _flash.stderr.on("data", function(data)
  {
    if(verb) process.stdout.write(data.toString());
  });

  _flash.on("error", function(err)
  {
    console.log("[!] Error :");
    console.log(err);
  });

  _flash.on("close", function(code)
  {
    console.log("[+] Flashed");
  });
}

var execFlashSTM32 = function(from, to)
{
  try
  {
    fs.writeFileSync(path.join(to, from), fs.readFileSync(from));
    console.log("[+ Flashed]");
  }
  catch(e)
  {
    console.log("[!] Your file is compiled, but an error occured while flashing, please try again.");
  }

}


var Flash = function(from, to, target, verb)
{
  switch(target)
  {
    case "uno":
      execFlashArduino(from, to, "ATMEGA328P", "arduino", "19200", verb);
      break;
    case "mega1280":
      execFlashArduino(from, to, "m1280", "arduino", "57600", verb);
      break;
    case "mega2560":
      execFlashArduino(from, to, "m2560", "wiring", "115200", verb);
      break;
    case "nucleo-l152re":
    case "nucleo-l432kc":
      execFlashSTM32(from, to);
      break;
    default:
      console.log("Nothing to do for target : " + target);
      break;
  }
}
module.exports = Flash;