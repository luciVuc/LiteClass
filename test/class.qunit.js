/**

  Category: Assert

  .async()   Instruct QUnit to wait for an asynchronous operation.
  .deepEqual()   A deep recursive comparison, working on primitive types, arrays, objects, regular expressions, dates and functions.
  .equal()   A non-strict comparison, roughly equivalent to JUnit’s assertEquals.
  .expect()  Specify how many assertions are expected to run within a test.
  .notDeepEqual()  An inverted deep recursive comparison, working on primitive types, arrays, objects, regular expressions, dates and functions.
  .notEqual()  A non-strict comparison, checking for inequality.
  .notOk()   A boolean check, inverse of ok() and CommonJS’s assert.ok(), and equivalent to JUnit’s assertFalse(). Passes if the first argument is falsy.
  .notPropEqual()  A strict comparison of an object’s own properties, checking for inequality.
  .notStrictEqual()  A strict comparison, checking for inequality.
  .ok()  A boolean check, equivalent to CommonJS’s assert.ok() and JUnit’s assertTrue(). Passes if the first argument is truthy.
  .propEqual()   A strict type and value comparison of an object’s own properties.
  .pushResult()  Report the result of a custom assertion
  .strictEqual()   A strict type and value comparison.
  .throws()  Test if a callback throws an exception, and optionally compare the thrown error.

 */

QUnit.module("LiteClass", function(hooks) {
  var handler = {

  };

  // hooks.before(function( assert ) {
  //   assert.ok( true, "before called" );
  // });
 
  // hooks.beforeEach(function( assert ) {
  //   assert.ok( true, "beforeEach called" );
  // });

  // hooks.afterEach(function(assert) {
  //   assert.ok( true, "afterEach called" );
  // });
 
  // hooks.after(function(assert) {
  //   assert.ok( true, "after called" );
  // });

  QUnit.test("'LiteClass' should be instantiatable", function(assert) {
    var test = new LiteClass();

    assert.ok( test instanceof LiteClass, "'LiteClass' instance created" );
    assert.ok( typeof LiteClass.getIdOf(test) === "string" &&  LiteClass.getIdOf(test).length > 0, "'LiteClass' instance has a unique ID" );
    assert.ok( LiteClass.getInstanceById( LiteClass.getIdOf(test)) === test, "'getInstanceById' returns the 'LiteClass' instance by ID" );
    assert.ok( LiteClass.getInstanceById("test") === undefined, "'getInstanceById' returns the undefined if invalid ID" );
  });

  QUnit.test("'LiteClass' should throw error when trying to assign a value to a data field not defined in the class descritptor", function (assert) {
    var test = new LiteClass();

    try {
      assert.ok( test.setProperty("name", "test"), "'setProperty' with an undefined property name works" );
    } catch (err) {
      assert.ok( err, "'setProperty' throws error with a property name not defined in the class descriptor" );
    }
    try {
      assert.ok( test.addAggregation("name", "test"), "'addAggregation' with an undefined aggregation name works" );
    } catch (err) {
      assert.ok( err, "'addAggregation' throws error with a aggregation name not defined in the class descriptor" );
    }

    // assert.ok( test.set === test.setProperty, "'set' is alias for 'setProperty'" );
    // assert.ok( test.add === test.addProperty, "'set' is alias for 'setProperty'" );

    // assert.ok( test.getProperty("name") === undefined, "'getProperty' returns 'undefined' for a property name not defined in the class descriptor" );
    // assert.ok( test.get("name") === undefined, "'get' returns 'undefined' for a property name not defined in the class descriptor" );
  });

  QUnit.test("'LiteClass' should return 'undefined' trying to retrieve the value of a data field not defined in the class descritptor", function (assert) {
    var test = new LiteClass();

    assert.ok( test.getProperty("name") === undefined, "'getProperty' returns 'undefined' for a property name not defined in the class descriptor" );
    assert.ok( test.getAggregation("name") === undefined, "'getAggregation' returns 'undefined' for a property name not defined in the class descriptor" );
  });


  QUnit.test("'LiteClass' should support inheritance with default settings", function(assert) {
    var Test = LiteClass.extend();
    assert.ok( typeof Test === "function" && Test.prototype instanceof LiteClass, " the new class created and is a subclass of 'LiteClass'" );

    var test = new Test();
    assert.ok( !!test, "the subclass can be instantiated" );
    assert.ok( test instanceof Test, "the instance object is instance of the subclass" );
    assert.ok( test instanceof LiteClass, "the instance object is also instance of the superclass" );
  });

  QUnit.test("'LiteClass' should support inheritance with custom settings", function(assert) {
    var Test = LiteClass.extend({
      "@private": {
        properties: {
          name: {
            defaultValue: "test",
            validator: function (s) {
              return typeof s === "string";
            }
          }
        },
        aggregations: {
          items: {
            validator: function (s) {
              return typeof s === "string";
            }
          }
        }
      }
    });
    assert.ok( typeof Test === "function" && Test.prototype instanceof LiteClass, " the new class created and is a subclass of 'LiteClass'" );

    var test = new Test();
    assert.ok( test instanceof Test, "subclass instantiated with default values" );

    assert.ok( test.getProperty("name") === "test", "'getProperty' returns the correct default value" );
    assert.ok( test.setProperty("name", "test1") instanceof Test, "the 'setProperty' assigns a valid value" );
    assert.ok( test.getProperty("name") === "test1", "'getProperty' returns the correct new value" );

    test.destroy();

    test = new Test({name: "hello"});
    assert.ok( test instanceof Test, "subclass instantiated with instance values" );

    assert.ok( test.getProperty("name") === "hello", "'getProperty' returns the correct instance value" );
    assert.ok( test.setProperty("name", "test1") instanceof Test, "the 'setProperty' assigns a valid value" );
    assert.ok( test.getProperty("name") === "test1", "'getProperty' returns the correct new value" );

    assert.ok( test.getAggregation("items") instanceof Array && test.getAggregation("items").length === 0, "'getAggregation' returns an empty array" );
    assert.ok( test.addAggregation("items", null), "'addAggregation' tries to add an invalid item" );
    assert.ok( test.getAggregation("items") instanceof Array && test.getAggregation("items").length === 0, "'getAggregation' still returns an empty array" );
    assert.ok( test.addAggregation("items", "test"), "'addAggregation' adds a valid item" );
    assert.ok( test.getAggregation("items") instanceof Array && test.getAggregation("items").length === 1, "'getAggregation' returns an empty array with 1 element" );
    assert.ok( test.getAggregationAt("items", 0) === "test", "'addAggregationAt' returns the correct element" );
    test.destroy();
  });

  QUnit.test("The 'LiteClass' setters and getters should alter and access the properties and aggreagtions", function(assert) {
    var Test = LiteClass.extend({
      "@private": {
        properties: {
          name: {
            defaultValue: "test",
            validator: function (s) {
              return typeof s === "string";
            }
          }
        },
        aggregations: {
          items: {
            validator: function (s) {
              return typeof s === "string";
            }
          }
        }
      }
    });
    assert.ok( typeof Test === "function" && Test.prototype instanceof LiteClass, " the new class created and is a subclass of 'LiteClass'" );

    var test = new Test({name: "one", items: ["one"]});
        // _test = test.getAggregationAsHashMap();
    assert.ok( test instanceof Test, "subclass instantiated with instance values" );

    // assert.ok( typeof _test === "object", "'getAggregationAsHashMap' returns an object literal" );

    assert.ok( test.getProperty("name") === "one", "'getProperty' returns the correct instance value" );
    assert.ok( test.setProperty("name", "test1").getProperty("name") === "test1", "the 'setProperty' assigns a valid value" );

    assert.ok( test.getAggregation("items") instanceof Array && test.getAggregation("items")[0] === "one", "'getAggregation' returns an array with one item" );
    assert.ok( test.getAggregationAt("items", 0) === test.getAggregation("items")[0], "'getAggregation(\"name\", index)' and 'getAggregationAt(\"name\")[index]' return the same item" );

    assert.ok( test.addAggregation("items", "two").getAggregationAt("items", 1), "'addAggregation' adds an item into the aggreagation" );
    assert.ok( test.removeLastAggregation("items") === "two" && test.getAggregation("items").length === 1, "'removeLastAggregation' removes the last item of the aggreagation" );

    assert.ok( test.addFirstAggregation("items", "zero").getAggregationAt("items", 0) === "zero", "'addFirstAggregation' prepents an item to the aggreagation" );
    assert.ok( test.removeFirstAggregation("items") === "zero" && test.getAggregation("items").length === 1, "'removeFirstAggregation' removes the first item of the aggreagation" );


    test.addAggregation("items", "two").addAggregation("items", "three");
    assert.ok( test.removeAggregation("items", "two") === "two" && test.getAggregation("items").length === 2, "'removeAggregation' removes the given item of the aggreagation" );
    assert.ok( test.removeAggregation("items", "five") === undefined && test.getAggregation("items").length === 2, "'removeAggregation' does not remove anything from the aggreagation if the given item is not found" );
    
    test.insertAggregationAt("items", 1, "two");
    assert.ok( test.getAggregationAt("items", 1) === "two" && test.getAggregation("items").length === 3, "'insertAggregation' inserts an item at the given position in the aggreagation" );
    
    assert.ok( test.removeAggregationAt("items", 1) === "two" && test.getAggregation("items").length === 2, "'removeAggregationAt' removes the item from the given position in the aggreagation" );
    assert.ok( test.removeAggregationAt("items", 5) === undefined && test.getAggregation("items").length === 2, "'removeAggregationAt' does not remove any item from the aggreagation if the given position is invalid" );
    
  
    assert.ok( test.removeAllAggregation("items").length === 2 && test.getAggregation("items").length === 0, "'removeAllAggregations' removes all items of the aggreagation" );

    assert.ok( test.applySettings({
      name: "hello",
      items: ["test"]
    }), "'applySettings' changes the value of multiple data fields at once" );
    assert.ok( test.getProperty("name") === "hello", "the 'getProperty' returns the correct value" );
    assert.ok( test.getAggregation("items") instanceof Array && test.getAggregation("items")[0] === "test", "'getAggregation' returns an array with one item" );

    test.destroy();
  });



});