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

$v.templateCompiler = {
    generatedJavaScript: [""],
    doc: null,
    
    executeJavaScriptFile: function(path, context) {
        console.log("include "+path);
        vm.runInNewContext(fs.readFileSync(path), context);
        //vm.runInThisContext(fs.readFileSync(path), path);
    }.bind(this),

    escapeJSString: function(s) {
        // Could use JSON here
        return s.
            replace(/\\/g, "\\\\").
            replace(/\"/g, "\\\"").
            replace(/\n/g, "\\n").
            replace(/\r/g, "\\r").
            replace(/\t/g, "\\t")
        ;
    },

    generateIndent: function(indent) {
        var ret="";
        for(var i=0;i<indent;i++) ret+="    ";
        return ret;
    },

    emitJavaScriptCode: function(code, scriptIndex) {
        var e = $v.templateCompiler.doc.createElement('div');
        e.innerHTML = code;
        $v.templateCompiler.generatedJavaScript[scriptIndex] += (e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue);
    },

    emitJavaScriptForNode: function(node, scriptIndex, useInnerHTML, indent) {
        var newScriptIndex = scriptIndex;
        //console.log("tag " + node.tagName + "\n");
        //console.log(node.innerHTML);
        if(node.nodeType == 3) {
            // Text node
            $v.templateCompiler.generatedJavaScript[newScriptIndex] += $v.templateCompiler.generateIndent(indent);
            if(node.textContent) {
                if(useInnerHTML) {
                    $v.templateCompiler.generatedJavaScript[newScriptIndex] += 
                        "ret+=\"" + 
                        $v.templateCompiler.escapeJSString(node.textContent) + 
                        "\";\n";
                } else {
                    $v.templateCompiler.generatedJavaScript[newScriptIndex] += 
                        "$v.dom.createTextNode(parent, \"" + 
                        $v.templateCompiler.escapeJSString(node.textContent) + 
                        "\");\n";
                }
            }
        } else {
            if(node.tagName != "BODY") {
                // Process element
                if(node.tagName.substr(0, 2) == "V:") {
                    // Vario tag
                    var varioTagName=node.tagName.substr(2).toLowerCase();
                    console.log("vario tag: " + varioTagName + "\n");
                    // check if emit code exists
                    if(fs.existsSync("../components/" + varioTagName + "/compile.js")) {
                        $v.templateCompiler.executeJavaScriptFile("../components/" + varioTagName + "/compile.js", {
                            $v: $v,
                            node: node,
                            scriptIndex: scriptIndex, 
                            useInnerHTML: useInnerHTML,
                            console: console
                        });
                        return;
                    }
                    // check if template exists and include it

                    // check if emit code exists and execute it
                }
                //console.log("tag " + node.tagName + "\n");
            }

            for(var i=0; i<node.childNodes.length; i++) {
                $v.templateCompiler.emitJavaScriptForNode(node.childNodes[i], scriptIndex, useInnerHTML, indent);
            }
        }
    }
 };