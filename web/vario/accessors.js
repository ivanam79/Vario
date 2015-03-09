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

/** 
 * A constant indicating value has changed
 * 
 * @property VALUE_CHANGED
 * @public 
 * @static
 * @final
 * @type int 
 * @for $v
 */
$v.VALUE_CHANGED = 0;

/** 
 * A constant indicating an item has been added to a collection
 * 
 * @property COLLECTION_ITEM_ADDED
 * @public 
 * @static
 * @final
 * @type int 
 */
$v.COLLECTION_ITEM_ADDED = 1;

/** 
 * A constant indicating an item has been removed from a collection
 * 
 * @property COLLECTION_ITEM_REMOVED
 * @public 
 * @static
 * @final
 * @type int 
 */
$v.COLLECTION_ITEM_REMOVED = 2;

/** 
 * A constant indicating an item in a collection has changed
 * 
 * @property COLLECTION_ITEM_REMOVED
 * @public 
 * @static
 * @final
 * @type int 
 */
$v.COLLECTION_ITEM_CHANGED = 3;

/**
 * Creates an accessor with initial value and a function which handles modifying and retrieving the underlying data
 * 
 * @method createAccessor
 * @public
 * @static
 * @param {Mixed} initialValue
 * @param {Function} accessorFunction
 * @returns {$v.Accessor}
 */
$v.createAccessor = function (initialValue, accessorFunction) {
    /**
     * Implementation of the Accessor base class
     * 
     * @class $v.Accessor
     */
    var accessor = function () {
        return accessorFunction.apply(this, arguments);
    }

    /**
     * Current value
     * 
     * @property {Mixed} currentValue
     * @public
     */
    accessor.currentValue = initialValue;

    /**
     * Array of registered listeners
     * 
     * @property {Array} listeners
     * @public
     */
    accessor.listeners = [];

    /**
     * Registers a listener for value changes
     * 
     * @example 
     *      var v1 = $v.value("value 1");
     *      v1.listen(function(newValue, oldValue, changeType, collectionKey) {
     *          alert("Value has changed");
     *      });
     *      v1("value 2");
     * @method listen
     * @param {function} f
     */
    accessor.listen = function (f) {
        accessor.listeners.push(f);
    };

    return accessor;
};

/**
 * Creates a value, which can be monitored for changes
 * 
 * @example
 *      var v1 = $v.value("value 1"); // creates and initializes a value
 *      console.log(v1());            // outputs "value 1"
 *      
 *      v1("value 2");                // updating a value
 *      console.log(v1());            // outputs "value 2"
 *      
 *      var val=$v.value();           // creates undefined value
 *      console.log(val());           // outputs undefined
 * @method value
 * @public
 * @static
 * @param {Mixed} [initialValue]
 * @returns {$v.ValueAccessor}
 * @for $v
 */
$v.value = function (initialValue) {
    // Create accessor function
    /**
     * Implementation of the ValueAccessor class
     * 
     * @class $v.ValueAccessor
     * @extends $v.Accessor
     */
    var valueAccessor = $v.createAccessor(initialValue, function () {
        if (arguments.length == 0) {
            // Read value
            return valueAccessor.currentValue;
        } else if (arguments.length == 1) {
            // Invoke listeners
            for (var i = 0; i < valueAccessor.listeners.length; i++) {
                if (valueAccessor.listeners[i](arguments[0], valueAccessor.currentValue, $v.VALUE_CHANGED) === false) {
                    // Updating value is canceled
                    return;
                }
            }
            // Write value
            valueAccessor.currentValue = arguments[0];
        } else {
            throw "$v.ValueAccessor() requires 0 or 1 arguments";
        }
    });

    return valueAccessor;
};

/**
 * Creates an array, which can be monitored for changes
 * 
 * @example
 *      var arr = $v.array([]); // creates an empty array
 *      arr.add(1);
 *      arr.add("b");
 *      console.log(arr());     // outputs [1, "b"]
 *      
 *      arr.insert("a", 1);     // inserts "a" at position 1
 *      arr.remove(2);          // removes the item at position 2
 *      console.log(arr());     // outputs [1, "a"]
 *      
 *      arr(0, "b");            // updates element at index 0
 *      console.log(arr(0));    // retrieves item at index 0 - "b"
 *      console.log(arr());     // outputs ["b", "a"]
 * @method array
 * @public
 * @static
 * @param {Mixed} [initialValue]
 * @returns {$v.ArrayAccessor}
 * @for $v
 */
$v.array = function (initialValue) {
    /**
     * Implementation of the ArrayAccessor class
     * 
     * @class $v.ArrayAccessor
     * @extends $v.Accessor
     */
    if(!initialValue) {
        initialValue = []; // Default empty
    }
    var arrayAccessor = $v.createAccessor(initialValue, function () {
        if(arguments.length == 1) {
            if((typeof arrayAccessor.currentValue[arguments[0]]) == "undefined") {
                throw "Array element " + arguments[0] + " doesn't exist";
            } else {
                return arrayAccessor.currentValue[arguments[0]];
            }
        } else if(arguments.length == 2) {
            if((typeof arrayAccessor.currentValue[arguments[0]]) == "undefined") {
                throw "Array element " + arguments[0] + " doesn't exist";
            } else {
                // Invoke listeners
                for (var i = 0; i < arrayAccessor.listeners.length; i++) {
                    if (arrayAccessor.listeners[i](arguments[1], arrayAccessor.currentValue[arguments[0]], $v.COLLECTION_ITEM_CHANGED, arguments[0]) === false) {
                        // Updating value is canceled
                        return;
                    }
                }
                // Write value                
                arrayAccessor.currentValue[arguments[0]] = arguments[1];
            }            
        } else {
            throw "$v.ArrayAccessor() requires 1 or 2 arguments";
        }
    });
    
    /**
     * Returns items count
     * 
     * @method count
     * @returns {int} items count
     */
    arrayAccessor.count = function () {
        return arrayAccessor.currentValue.length;
    };
    
    /**
     * Appends a new item
     * 
     * @method add
     * @param {Mixed} item
     */
    arrayAccessor.add = function (item) {
        // Invoke listeners
        for (var i = 0; i < arrayAccessor.listeners.length; i++) {
            if (arrayAccessor.listeners[i](item, null, $v.COLLECTION_ITEM_ADDED, arrayAccessor.currentValue.length) === false) {
                // Updating value is canceled
                return;
            }
        }
        arrayAccessor.currentValue.push(item);
    };

    /**
     * Inserts new item at specified position
     * 
     * @method insert
     * @param {int} index
     * @param {Mixed} item
     */
    arrayAccessor.insert = function (index, item) {
        // Invoke listeners
        for (var i = 0; i < arrayAccessor.listeners.length; i++) {
            if (arrayAccessor.listeners[i](item, null, $v.COLLECTION_ITEM_ADDED, index) === false) {
                // Updating value is canceled
                return;
            }
        }
        arrayAccessor.currentValue.splice(index, 0, item);
    };

    /**
     * Removes item at specified position
     * 
     * @method remove
     * @param {int} index
     */
    arrayAccessor.remove = function (index) {
        if((typeof arrayAccessor.currentValue[arguments[0]]) == "undefined") {
            throw "Array element " + arguments[0] + " doesn't exist";
        } else {
            // Invoke listeners
            for (var i = 0; i < arrayAccessor.listeners.length; i++) {
                if (arrayAccessor.listeners[i](null, arrayAccessor.currentValue[index], $v.COLLECTION_ITEM_REMOVED, index) === false) {
                    // Updating value is canceled
                    return;
                }
            }
            arrayAccessor.currentValue.splice(index, 1);
        }                
    };

    return arrayAccessor;
};

/**
 * Creates a hash map, which can be monitored for changes
 * 
 * @example
 *      var hm = $v.array({}); // creates an empty hash map
 *      hm("key1", "value1");  // inserts or updates new item
 *      hm("key2", "value2");
 *      
 *      console.log(hm("key1")); // outputs "value 1"
 *      console.log(hm());       // outputs {key1: value1, key2: value2}
 *      
 *      hm.remove("key1");       // removes item
 * @method hashMap
 * @public
 * @static
 * @param {Mixed} [initialValue]
 * @returns {$v.HashMapAccessor}
 * @for $v
 */
$v.hashMap = function (initialValue) {
    // TODO
};
