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
var regFlags = "igmsuy";
function isRegExp(_token)
{
	if(_token.length < 2)
	{
		return {error: false, check: false};
	}
	
	if( _token.length > 2 && _token[ 0 ] == "/" && _token[ _token.length - 2 ] == "/" && regFlags.indexOf(_token[ _token.length - 1 ]) > -1 != "/")
	{
		return {error: false, check: true, type: "REGEXP"};
	}
	
	if(_token[0] != "/" || _token[ _token.length - 1 ] != "/")
	{
		return {error: false, check: false};
	}
	return {error: false, check: true, type: "REGEXP"};
}

module.exports = isRegExp;