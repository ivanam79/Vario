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

var tests = {
    ValueAccessorTest: function () {
        var errors = [];

        var a1 = $v.value();
        if ((typeof a1()) != "undefined")
            errors.push("a1 default accessor value is not undefined");

        var a2 = $v.value("asd");
        if (a2() != "asd")
            errors.push("a2 unexpected accessor value after creation");

        a2("dfg");
        if (a2() != "dfg")
            errors.push("a2 failed setting accessor value");

        var change1Captured = false;
        a2.listen(function (newValue, oldValue, changeType, collectionKey) {
            change1Captured = true;
            if (newValue != "sde")
                errors.push("a2 listener newValue incorrect");
            if (oldValue != "dfg")
                errors.push("a2 listener oldValue incorrect");
            if (changeType != $v.VALUE_CHANGED)
                errors.push("a2 listener changeType incorrect");
            if ((typeof collectionKey) != "undefined")
                errors.push("a2 listener collectionKey incorrect");
        });

        if (a2.listeners.length != 1)
            errors.push("a2 failed registering listener");

        var change2Captured = false;
        a2.listen(function (newValue, oldValue, changeType, collectionKey) {
            change2Captured = true;

            if (newValue != "sde")
                errors.push("a2 second listener newValue incorrect");
            if (oldValue != "dfg")
                errors.push("a2 second listener oldValue incorrect");
            if (changeType != $v.VALUE_CHANGED)
                errors.push("a2 second listener changeType incorrect");
            if ((typeof collectionKey) != "undefined")
                errors.push("a2 second listener collectionKey incorrect");
        });

        if (a2.listeners.length != 2)
            errors.push("a2 failed registering second listener");
        a2("sde");
        if (!change1Captured)
            errors.push("a2 listener didn't execute");
        if (!change2Captured)
            errors.push("a2 second listener didn't execute");

        a1("asd");
        a1.listen(function () {
            return false;
        });

        a1("qwe");
        if (a1() == "qwe")
            errors.push("a1 listener didn't cancel update");
        if (a1() != "asd")
            errors.push("a1 unexpected value after canceled update");

        return errors;
    },
    ArrayAccessorTest: function () {
        var errors = [];
        var arr1 = $v.array();

        arr1.add("item1");
        if (arr1.count() != 1)
            errors.push("arr1 unexpected count after adding first element");
        if (arr1(0) != "item1")
            errors.push("arr1 unexpected first element value");

        var addCaptured = false;
        var changeCaptured = false;
        var removeCaptured = false;
        arr1.listen(function (newValue, oldValue, changeType, collectionKey) {
            if (changeType == $v.COLLECTION_ITEM_ADDED) {
                addCaptured = true;
                if (newValue != "item2")
                    errors.push("arr1 COLLECTION_ITEM_ADDED listener newValue incorrect");
                if (oldValue != null)
                    errors.push("arr1 COLLECTION_ITEM_ADDED listener oldValue incorrect");
                if (collectionKey != 1)
                    errors.push("arr1 COLLECTION_ITEM_ADDED listener collectionKey incorrect");
            } else if (changeType == $v.COLLECTION_ITEM_CHANGED) {
                changeCaptured = true;
                if (newValue != "item3")
                    errors.push("arr1 COLLECTION_ITEM_CHANGED listener newValue incorrect");
                if (oldValue != "item1")
                    errors.push("arr1 COLLECTION_ITEM_CHANGED listener oldValue incorrect");
                if (collectionKey !== 0)
                    errors.push("arr1 COLLECTION_ITEM_CHANGED listener collectionKey incorrect");
            } else if (changeType == $v.COLLECTION_ITEM_REMOVED) {
                removeCaptured = true;
                if (newValue != null)
                    errors.push("arr1 COLLECTION_ITEM_REMOVED listener newValue incorrect");
                if (oldValue != "item3")
                    errors.push("arr1 COLLECTION_ITEM_REMOVED listener oldValue incorrect");
                if (collectionKey !== 0)
                    errors.push("arr1 COLLECTION_ITEM_REMOVED listener collectionKey incorrect");
            }
        });

        arr1.add("item2");
        if (!addCaptured)
            errors.push("arr1 COLLECTION_ITEM_ADDED listener didn't execute");
        arr1(0, "item3");
        if (!changeCaptured)
            errors.push("arr1 COLLECTION_ITEM_CHANGED listener didn't execute");
        arr1.remove(0);
        if (!removeCaptured)
            errors.push("arr1 COLLECTION_ITEM_REMOVED listener didn't execute");
        if ((arr1.count() != 1) || (arr1(0) != "item2"))
            errors.push("arr1 unexpected end result");

        // Insert and cancel test
        addCaptured = false;
        var arr2 = $v.array(["i1", "i3"]);
        arr2.listen(function (newValue, oldValue, changeType, collectionKey) {
            if (changeType == $v.COLLECTION_ITEM_ADDED) {
                if (!addCaptured) {
                    addCaptured = true;
                    if (newValue != "i2")
                        errors.push("arr2 COLLECTION_ITEM_ADDED listener newValue incorrect");
                    if (oldValue != null)
                        errors.push("arr2 COLLECTION_ITEM_ADDED listener oldValue incorrect");
                    if (collectionKey != 1)
                        errors.push("arr2 COLLECTION_ITEM_ADDED listener collectionKey incorrect");
                }
            }
        });
        arr2.insert(1, "i2");
        if (!addCaptured)
            errors.push("arr2 COLLECTION_ITEM_ADDED listener didn't execute");
        arr2.listen(function () {
            return false;
        });
        arr2.add("i4");
        arr2.insert(0, "i4");
        arr2.remove(1);
        arr2(0, "i4");
        if (
                (arr2.count() != 3) ||
                (arr2(0) != "i1") ||
                (arr2(1) != "i2") ||
                (arr2(2) != "i3")
                ) {
            errors.push("arr2 unexpected end result");
        }

        return errors;
    }
};

window.onload = function () {
    var resultsElement = document.getElementById("testResults");
    for (var t in tests) {
        var errors = tests[t]();
        if (errors.length > 0) {
            resultsElement.innerHTML += "<div style=\"color: #ff0000\">" + t + " failed</div>";
            for (var i = 0; i < errors.length; i++) {
                resultsElement.innerHTML += "<div style=\"color: #ff0000\">&nbsp;&nbsp;&nbsp;&nbsp;" + errors[i] + "</div>";
            }
        } else {
            resultsElement.innerHTML += "<div style=\"color: #00ff00\">" + t + " ok</div>";
        }
    }
};