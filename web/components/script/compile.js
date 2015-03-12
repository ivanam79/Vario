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

(function(node, scriptIndex, useInnerHTML) {
    //console.log("script: " + node.innerHTML);
    var tc = $v.templateCompiler;
    if(!tc.components.script) {
        tc.components.script = { 
            active: true
        };            
        
        var _initFunction = function() {
            // Init script component
            if( (typeof scriptAccessorMonitor) == "undefined") {
                var scriptAccessors = {};
                var suppressScriptAccessorsFlag = false;
                var scriptAccessorMonitor = function(accessor) {
                    if(!suppressScriptAccessorsFlag) {
                        scriptAccessors[accessor.id] = accessor;
                    }
                };
                $v.AccessorMonitors.add(scriptAccessorMonitor);
            }
        };
        
        var _cleanupFunction = function() {
            // Cleanup script component
            $v.AccessorMonitors.remove(scriptAccessorMonitor);
        };
        
        tc.emitJavaScriptFunctionBody(_initFunction, scriptIndex);
        tc.currentBlockCleanupFunctions.push(function() {
            delete tc.components.script;
            tc.emitJavaScriptFunctionBody(_cleanupFunction, scriptIndex);
        });        
    }
    $v.templateCompiler.emitJavaScriptCode(node.innerHTML, scriptIndex);
})(node, scriptIndex, useInnerHTML);
