/*** From Osama Abbas - Bytenode - https://github.com/OsamaAbbas/bytenode ***/
/*** Modified to work with Nexe - PKG ***/

function Binary()
{
	const fs = require('fs');
	const vm = require('vm');
	const v8 = require('v8');
	const path = require('path');
	const Module = require('module');

	function setFlags()
	{
		v8.setFlagsFromString('--no-lazy');

		try
		{
		  v8.setFlagsFromString('--no-flush-bytecode');
		} catch (e) { }

	}

	function unsetFlags()
	{
		v8.setFlagsFromString('--lazy');

		try
		{
		  v8.setFlagsFromString('--flush-bytecode');
		} catch (e) { }

	}

	// Force extname to .bin
	const COMPILED_EXTNAME = '.bin';
	this.extName = COMPILED_EXTNAME;
	/**
	 * Generates v8 bytecode buffer.
	 * @param   {string} javascriptCode JavaScript source that will be compiled to bytecode.
	 * @returns {Buffer} The generated bytecode.
	 */
	this.compileCode = function (javascriptCode)
	{

	  if (typeof javascriptCode !== 'string')
	  {
		throw new Error(`javascriptCode must be string. ${typeof javascriptCode} was given.`);
	  }

	  let script = new vm.Script(javascriptCode,
	  {
		produceCachedData: true
	  });

	  let bytecodeBuffer = (script.createCachedData && script.createCachedData.call) ?
		script.createCachedData()
		:
		script.cachedData;

	  return bytecodeBuffer;
	};

	this.fixBytecode = function (bytecodeBuffer)
	{

	  if (!Buffer.isBuffer(bytecodeBuffer))
	  {
		throw new Error(`bytecodeBuffer must be a buffer object.`);
	  }

	  let dummyBytecode = this.compileCode("NECTAR");

	  if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9'))
	  {
		// Node is v8.8.x or v8.9.x
		dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
		dummyBytecode.slice(20, 24).copy(bytecodeBuffer, 20);
	  }
	  else if (process.version.startsWith('v12') || process.version.startsWith('v13'))
	  {
		dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
	  }
	  else
	  {
		dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
		dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
	  }
	};

	this.readSourceHash = function (bytecodeBuffer) 
	{

	  if (!Buffer.isBuffer(bytecodeBuffer))
	  {
		throw new Error(`bytecodeBuffer must be a buffer object.`);
	  }

	  if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) 
	  {
		// Node is v8.8.x or v8.9.x
		return bytecodeBuffer.slice(12, 16).reduce((sum, number, power) => sum += number * Math.pow(256, power), 0);
	  }
	  else
	  {
		return bytecodeBuffer.slice(8, 12).reduce((sum, number, power) => sum += number * Math.pow(256, power), 0);
	  }
	};

	/**
	 * Runs v8 bytecode buffer and returns the result.
	 * @param   {Buffer} bytecodeBuffer The buffer object that was created using compileCode function.
	 * @returns {any}    The result of the very last statement executed in the script.
	 */
	this.loadBytecode = function (bytecodeBuffer)
	{

	  if (!Buffer.isBuffer(bytecodeBuffer))
	  {
		throw new Error(`bytecodeBuffer must be a buffer object.`);
	  }

	  this.fixBytecode(bytecodeBuffer);

	  let length = this.readSourceHash(bytecodeBuffer);

	  let dummyCode = "";

	  if (length > 1)
	  {
		dummyCode = '"' + "\u200b".repeat(length - 2) + '"'; // "\u200b" Zero width space
	  }

	  let script = new vm.Script(dummyCode,
	  {
		cachedData: bytecodeBuffer
	  });

	  if (script.cachedDataRejected)
	  {
		throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
	  }

	  return script.runInThisContext();
	};

	/**
	 * Compiles JavaScript file to .jsc file.
	 * @param   {object|string} args
	 * @param   {string}          args.filename The JavaScript source file that will be compiled
	 * @param   {boolean}         [args.compileAsModule=true] If true, the output will be a commonjs module
	 * @param   {string}          [args.output=filename.jsc] The output filename. Defaults to the same path and name of the original file, but with `.jsc` extension.
	 * @param   {string}        [output] The output filename. (Deprecated: use args.output instead)
	 * @returns {string}        The compiled filename
	 */
	this.compileFile = function (args) 
	{
	  // NEXE Compatibility
	  setFlags()
	  let filename, compileAsModule;

	  if (typeof args === 'string') 
	  {
		filename = args;
		compileAsModule = true;
	  }
	  else if (typeof args === 'object') 
	  {
		filename = args.in;
		compileAsModule = args.compileAsModule !== false;
	  }

	  if (typeof filename !== 'string') 
	  {
		throw new Error(`filename must be a string. ${typeof filename} was given.`);
	  }

	  let compiledFilename = args.out || filename.slice(0, -3) + COMPILED_EXTNAME;

	  if (typeof compiledFilename !== 'string')
	  {
		throw new Error(`output must be a string. ${typeof compiledFilename} was given.`);
	  }

	  let javascriptCode = fs.readFileSync(filename, 'utf-8');

	  let bytecodeBuffer;

	  if (compileAsModule) 
	  {
		bytecodeBuffer = this.compileCode(Module.wrap(javascriptCode.replace(/^#!.*/, '')));
	  }
	  else 
	  {
		bytecodeBuffer = this.compileCode(javascriptCode.replace(/^#!.*/, ''));
	  }

	  fs.writeFileSync(compiledFilename, bytecodeBuffer);
	  
	  unsetFlags();
	  return compiledFilename;
	};

	/**
	 * Runs .jsc file and returns the result.
	 * @param   {string} filename
	 * @returns {any}    The result of the very last statement executed in the script.
	 */
	this.loadFile = function (filename) 
	{
	  // NEXE Compatibility
	  setFlags()
	  if (typeof filename !== 'string') 
	  {
		throw new Error(`filename must be a string. ${typeof filename} was given.`);
	  }

	  let bytecodeBuffer = fs.readFileSync(filename);
	  
	  unsetFlags();
	  return this.loadBytecode(bytecodeBuffer);
	};

	Module._extensions[COMPILED_EXTNAME] = function (module, filename) 
	{

	  let bytecodeBuffer = fs.readFileSync(filename);
	  _binary.fixBytecode(bytecodeBuffer);

	  let length = _binary.readSourceHash(bytecodeBuffer);

	  let dummyCode = "";

	  if (length > 1) 
	  {
		dummyCode = '"' + "\u200b".repeat(length - 2) + '"'; // "\u200b" Zero width space
	  }

	  let script = new vm.Script(dummyCode, 
	  {
		filename: filename,
		lineOffset: 0,
		displayErrors: true,
		cachedData: bytecodeBuffer
	  });

	  if (script.cachedDataRejected) 
	  {
		throw new Error('Invalid or incompatible cached data (cachedDataRejected)');
	  }

	  /*
	  This part is based on:
	  https://github.com/zertosh/v8-compile-cache/blob/7182bd0e30ab6f6421365cee0a0c4a8679e9eb7c/v8-compile-cache.js#L158-L178
	  */

	  function require(id)
	  {
		return module.require(id);
	  }
	  require.resolve = function (request, options)
	  {
		  console.log(request);
		return Module._resolveFilename(request, module, false, options);
	  };
	  require.main = process.mainModule;

	  require.extensions = Module._extensions;
	  require.cache = Module._cache;

	  let compiledWrapper = script.runInThisContext(
	  {
		filename: filename,
		lineOffset: 0,
		columnOffset: 0,
		displayErrors: true,
	  });

	  let dirname = path.dirname(filename);

	  let args = [module.exports, require, module, filename, dirname, process, global];

	  return compiledWrapper.apply(module.exports, args);
	};
}

module.exports = new Binary();