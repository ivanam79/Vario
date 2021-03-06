/* 
 * Copyright (c) 2015, Ivan Mishonov <ivan@conquex.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


var fs = require("fs");
var vm = require("vm");
var jsdom = require("jsdom").jsdom;
var beautify = require('js-beautify').js_beautify;

/*var console = {
    log: function(data) {
        process.stdout.write(data);
        process.stdout.write("\n");
    }
};*/

var include = function(path, context) {
    console.log("include "+path);
    vm.runInNewContext(fs.readFileSync(path), context, path);
    //eval(fs.readFileSync(path));
}.bind(this);

$v = {};
include("../tools/templateCompiler.js", {
    $v: $v,
    vm: vm,
    fs: fs,
    console: console
});

var filename=process.argv[2];
process.stdout.write("Building template: "+filename+" ... \n");
var html = fs.readFileSync(filename);
var doc = jsdom("<html><head></head><body>" + html + "</body></html>");

//console.log(doc.body.childNodes[0].tagName);
$v.templateCompiler.doc = doc;
$v.templateCompiler.emitJavaScriptForNode(doc.body, 0, true, 1);

for(var i=0; i<$v.templateCompiler.currentBlockCleanupFunctions.length; i++) {
    $v.templateCompiler.currentBlockCleanupFunctions[i]();
}

console.log($v.templateCompiler.generatedJavaScript[0]);