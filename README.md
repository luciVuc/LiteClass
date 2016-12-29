## LiteClass
A JS module aiming to simplify object-oriented programming in JavaScript.


### Usage
To use this module in a project, it should first be downloaded or installed locally by executing the

```npm install LiteClass```

command in the terminal.

#### CommonJS support
In an environment that supports `CommonJS`, such as Node.js, it should be loaded and referenced using a `require` statement, such as the following:

```var LiteClass = require('LiteClass');```

#### Browser support
For the client-side environment, such as a regular web page with no `CommonJS` support, it could be loaded and referenced using a script tag, such as

```<script type="text/javascript" src="[path]/node_modules/LiteClass/dist/class.js"></script>```

where `[path]` is the path to the **LiteClass** folder on the local file system.


### Description
**LiteClass** is a JS module that aims to facilitate object-oriented programming (OOP) in JavaScript by simplifying the process of creating and extending classes through prototypal inheritance.
At its core it is a pure JS class (constructor function) enhanced with some OOP specific features, such as support for inheritance, data abstraction, data field access control (through a generic API of *getters* and *setters*) and event-driven programming.
The role of this constructor is to serve as the generic *super-class* of all JS classes (constructor functions) in a project, so that all its instances and the instances of its *sub-classes* inherit and share the same basic set of OOP features and capabilities.


### Inheritance
#### Creating new classes
To support inheritance, and implicitly the ability of creating other JS classes similar to itself, each **LiteClass** constructor will *own* a version of a *static* function called `extend`. The role of this function is to generate and return, through the process of *prototypal* inheritance, new class constructors by sub-classing the class that *owns* it.
Therefore, to create a new class of type **LiteClass** simply invoke the *static* function `extend` of the super-class as in the following statement:

```var MyClass = LiteClass.extend();```

After successfully executing this statement the `MyClass` variable will reference a new class constructor identical with its super-class (the **LiteClass** constructor, in this case) in the sense that it will contain no additional data fields or functionality.

##### The ***class descriptor*** parameter
To define a new class with customized behavior, enhancements and/or capabilities, the `extend` function supports  the ***class descriptor*** parameter (an optional parameter of type `object`), whose role is to pass a set of defining options for the new class in a key-value pair (KVP) format. This set of options allows to specify the custom behavior, additional functionality and/or data fields specific to the new class.

```js
// create the new class with a **class descriptor** parameter
var MyClass = LiteClass.extend({

    // the private data field of the class (data fields descriptors)
    "@private": {

        // property descriptors
        properties: {
        },

        // aggregation descriptors
        aggregations: {
        }
    },

    // the static members of the class
    "@static": {
    },

    // custom constructor
    constructor: function (mConfig) {
        // it's mandatory to call first the 'super class' constructor
        this.constructor.super_.apply(this, arguments);
        // custom definition goes here...
        // ...
    },

    // called by the constructor automatically as part of the instantiation process
    init: function (mConfig) {
        // custom definition goes here...
        // ...
        // finally call the 'super-class' version
        return this.constructor.super_.prototype.init.apply(this, arguments);
    },

    // additional user-defined instance members/methods go here
    //...

    // called to deallocate resources
    destroy: function () {
        // custom definition goes here...
        // ...
        // finally call the 'super-class' version
        return this.constructor.super_.prototype.destroy.apply(this, arguments);
    }
});
```

Even though the ***class descriptor*** parameter does not have any required options or properties, it does have two default options (the `"@static"` and the `"@private"` properties) with predefined roles.

##### The `"@static"` option
The role of the `"@static"` option is to specify (also in a KVP format) the *static* members of the class. These members, which could be functions, constant values or enumeration (i.e. the `extend` function), will be attached to the class function itself and will be accessible via the class name (not through an instance of the class).

```js
// the static members of the class
"@static": {
	<name>: <value>,
	<nmae>: {
		value: <value>,
		readonly: <boolean>
	}
}
```

As shown in the example above, a *static* member of the class could be specified in two ways:
- as a simple value, which will be attached to the class *as-is*, or
- as an object with two properties:
	- `value`, which allows to specify the value of the member to be attached to the class, and
	- `readonly`, a `boolean` property which allows to specify whether the value of the member can be modified or not.

The `<name>` placeholder represents the name of that **static** member of the class.

##### The `"@private"` option
The role of the `"@private"` option is to specify, in a similar KVP format, the internal state of the class (its instance *data fields* along with their *descriptors*), where the key is the name of the **data field** and the value is its corresponding ***data field descriptor***.

A ***data field descriptor*** is an object literal containing (in a KVP format) the options applicable for defining a particular ***data field*** of the class, while a ***data field*** is a data element that defines the internal state of an instance of the class.
Internally, a ***data field*** is backed up by a *private* instance variable, which should not be accessed directly by any code outside of the class. Instead, accessing and/or modifying a ***data field*** of an instance of the class should **only** be performed through the predefined generic API of *setters* and *getters* available to all instances of a class.
Based on the number of data values it should store (or reference), a ***data field*** could be:
- a **property** - a type of ***data field*** that can store a single-value data, or
- an **aggregation** - a type of ***data field*** that can store a collection or reference multiple values of similar data type.

For this reason, the `"@private"` option of the ***class descriptor*** parameter may have one or both of the two options listed below:
- `properties` - an object literal that holds the ***property descriptors*** (the ***data field descriptors*** for the *properties* of the class),
- `aggregations` - an object literal that holds the ***aggregation descriptors***, (the ***data field descriptors*** for the *aggregations* of the class),

and each ***data field descriptor*** should belong to one of these two options, according to its purpose.


Here is the basic structure of the `"@private"` option and its ***data field descriptor***:

```js
// ....
// data fields descriptor
"@private": {

    // property descriptors
    properties: {
        <name>: {
            defaultValue: <value>, // a value valid for this data field
            validator: <function> // returns true if the argument is valid for this property
        }
    },

    // aggregation descriptors
    aggregations: {
        <name>: {
            validator: <function> // returns true if the argument is valid for this aggregation
        }
    }
}
```

The `<name>` placeholder, in the code snippet above, represents the name of the **data field** that a particular ***data field descriptor*** describes, and its value is the object literal containing the set of applicable *options* for defining it as a data field of the class.

###### The `validator` option
One of the options, applicable to both categories of data fields, is called `validator` and its value, referenced by the `<function>` placeholder, is a Boolean returning function. The role of this function is to *validate* a value before assigning it to that data field. More specifically, it serves to decide whether to accept or reject a given value before assigning it to that data field. Therefore, when providing a `validator` option it is very important to make sure that it’s value is a function that returns `true` if the argument it is called with is a valid value for that data field, or `false` otherwise. By default, the *`validator`* function returns `true` in any case, allowing any value to be assigned to that data field.

###### The `defaultValue` option
Another defining *option* for a ***data field descriptor*** is called `defaultValue` and is applicable to the *property* types of ***data fields*** only. Its role is to hold a *default* value for that particular property, which will be used to initialize the property if the user does not provide a valid instantiation value. By default, the value of the `defaultValue` option for any ***property descriptor*** is `null`.

##### The `public` interface
All the other options (properties) of the ***class descriptor*** argument, including the user-defined ones, will be interpreted as the public interface of the class and will be attached to its prototype. Therefore, they will be accessible only via an instance of the class.

##### Example
As an example, here is a simple class definition that describes a *Car* data type:
```js
var Car = LiteClass.extend({
    // define the data fields
    "@private": {
        properties: {
            make: {
                defaultValue: "",
                validator: function (arg) {
                	// allow any string value
                    return typeof arg === "string";
                }
            },
            model: {
                defaultValue: "",
                validator: function (arg) {
                	// allow any string value
                    return typeof arg === "string";
                }
            },
            year: {
                defaultValue: 1900,
                validator: function (arg) {
                	// allow any 4-digit integer grater than 1900
                    arg = parseInt(arg);
                    return !isNaN(arg) && arg >= 1900 && arg <= 9999;
                }
            },
            color: {
                defaultValue: "",
                validator: function (arg) {
                	// allow any string value
                    return typeof arg === "string";
                }
            },
            mileage: {
                defaultValue: 0,
                validator: function (arg) {
                	// allow any non-negative integer
                    arg = parseInt(arg);
                    return !isNaN(arg) && arg >= 0;
                }
            },
            price: {
                defaultValue: 0,
                validator: function (arg) {
                	// allow any non-negative floating number
                    arg = parseFloat(arg);
                    return !isNaN(arg) && arg >= 0;
                }
            }
        }
    },

    // passes the internal state of the object in JSON format to the output callback argument
    print: function (outCallback) {
        var json = this.toJSON();
        if (typeof outCallback === "function") {
            outCallback(json);
        }
        return this;
    }
});
```

### Instantiation
#### Creating instances of ***LiteClass*** type
Since the `LiteClass` (sub)classes are normal JS function constructors they can be instantiated with the `new` keyword, as in the following example:

```js
var car = new Car();

// print the car info on the console
car.print(function (data) {
    console.log("\tCAR INFO: \n\t------------------------\n" +
    	JSON.stringify(data)
    		.replace("{", "\t")
            .replace(/\,/g, ",\n\t")
        	.replace(/(\"\:)/g, "\"\t\:\t")
            .replace("}", ""));

    // enable chained method calls
    return this;
});
```

After the succesfull execution of the statements above the variable `car` will reference an instance of type `LiteClass` and the following output will be logged on the console.

```
// result:
//
// VM1050:4 	CAR INFO:
//	------------------------
//	"make"	:	"",
//	"model"	:	"",
//	"year"	:	1900,
//	"color"	:	"",
//	"mileage"	:	0,
//	"price"	:	0
```


##### Type checking support
Because the `LiteClass` instances are created using the `new` keyword, it is possible to check the type of an instance using the JS `instanceof` operator. Therefore, statements such as the following are all valid:

```js
car instanceof Car; // true
car instanceof LiteClass; // true

var Plane = LiteClass.extend();
car instanceof Plane; // false
```

##### The `mSettings` argument
The example above shows an object instantiated with the default values provided in ***class descriptor*** `"@private"` property. However, to instantiate a ***LiteClass*** type with user-defined values for its data fields, the default constructor supports an optional parameter, `mSettings`. This parameter is an object literal that is used to pass to the constructor valid instantiation values for the predefined ***data fields*** of the class. More specifically, the name of each property of the `mSettings` object should match the name of a data field (*property* or *aggregation*) defined in the `"@private"` option of the ***class descriptor*** parameter, otherwise it will be ignored. Samewise, the value of each property of the `mSettings` parameter should be valid for its corresponding data field of the class, otherwise it will be rejected during validation and the default value will be used instead.

In addition to all the properties applicable to the `mSettings` parameter of a particular class, there is the `"#"` property, applicable to all the ***LiteClass*** classes and sub-classes, which allows the user to try to specify the *unique id* value for a particular instance (it will only be applied if it is unique).

Below is an example of instantiation using custom instance values

```js
var car = new Car({
	"#": "0001"
	make: "Ford",
	model: "Fusion",
	color: "Titanium",
	year: 2016,
	mileage: 10000,
	price: 23000.99
});

car.print(function (data) {
    console.log("\tCAR INFO: \n\t------------------------\n" +
        JSON.stringify(data)
            .replace("{", "\t")
            .replace(/\,/g, ",\n\t")
            .replace(/(\"\:)/g, "\"\t\:\t")
            .replace("}", ""));

    // enable chained method calls
    return this;
});
```
and the result logged on the console will show:
```
// result:
//
// VM1053:11 	CAR INFO:
// ------------------------
//	"make"	:	"Ford",
//	"model"	:	"Fusion",
//	"year"	:	2016,
//	"color"	:	"Titanium",
//	"mileage"	:	10000,
//	"price"	:	23000.99
```
#### Data Field Access Control

Since the internal state of a `LiteClass` instance is made up of *private* variables, which should not be accessed directly, the *public* interface of the base class exposes a set of *setter* and *getter* methods, which control the access to the values of these data fields. As a result, each instance of a `LiteClass` type *inherits* and gains access to this set of data field access control methods.

##### Reference
The set of data field access control contains methods for:

- Property access control, which include:
  - `.getProperty(name)` - returns the value of the property `name`,
  - `.get(name)` - returns the value of the property (or aggregation) `name`,
  - `.setProperty(name, value)` - sets the argument `value`, if it is valid, to the property `name`,
  - `.set(name, value)` - sets the argument `value`, if it is valid, to the property `name`,

- Aggregation access control, which include:
  - `.getAggregation(name)` - returns an array with the content of the aggregation `name`,
  - `.get(name)` - returns the value of the aggregation (or property) `name`,
  - `.getAggregationAsHashMap(name)` - returns a associative array with the content of the aggregation `name`,
  - `.toHashMap(name)` - returns a associative array with the content of the aggregation `name`,
  - `.getAggregationAt(name, index)` - returns the item of the aggregation `name` at position `index`,
  - `.at(name, index)` - returns the item of the aggregation `name` at position `index`,
  - `.indexOfAggregation(name, item)` - returns the index of the item `item` in aggregation `name` (or -1, if it is not found),
  - `.indexOf(name, item)` - returns the index of the item `item` in aggregation `name` (or -1, if it is not found),
  - `.addAggregation(name, item, bSupressEvent)` - adds the item `item` to the aggregation `name`,
  - `.add(name, item, bSupressEvent)` - adds the item `item` to the aggregation `name`,
  - `.removeLastAggregation(name, bSupressEvent)` - removes the last item in the aggregation `name`,
  - `.removeLast(name, bSupressEvent)` - removes the last item in the aggregation `name`,
  - `.removeAggregation(name, item, bSupressEvent)` - removes the item `item` in the aggregation `name`,
  - `.remove(name, item, bSupressEvent)` - removes the item `item` in the aggregation `name`,
  - `.insertAggregationAt(name, index, item, bSupressEvent)` - adds item `item` to the aggregation `name` at position `index`,
  - `.insertAt(name, index, item, bSupressEvent)` - adds item `item` to the aggregation `name` at position `index`,
  - `.removeAggregationAt(name, index, bSupressEvent)` - removes item `item` from the aggregation `name` at position `index`,
  - `.removeAt(name, index, bSupressEvent)` - removes item `item` from the aggregation `name` at position `index`,
  - `.removeAllAggregations(name, bSupressEvent)` - removes all items from the aggregation `name`
  - `.removeAll(name, bSupressEvent)` - removes all items from the aggregation `name`

- General-purpose:
  - `.applySettings(mSettings, mOptions)` - sets the values passed as key-value pairs in the `mSettings` associative array to the object's data fields defined in the aggregation and property descriptor objects. The `mOptions` argument can be used to pass the `bSupressEvent` option as a KVP with the key called `supressEvent`. Example: `obj.applySettings({}, {suppressEvent: true});`,
  - `.apply(mSettings, mOptions)` - sets the values passed as key-value pairs in the `mSettings` associative array to the object's data fields defined in the aggregation and property descriptor objects. The `mOptions` argument can be used to pass the `bSupressEvent` option as a KVP with the key called `supressEvent`. Example `obj.applySettings({}, {suppressEvent: true});`
  - `.clone()` - generates and returns a copy of the instance
  - `.getUID()` - returns the unique id of the instance.

- Static members:
  - `.extend(mConfig)` - creates a sub-class of an existing class of type `LiteClass`.

#### Events
Through a built-in ‘PubSub’ mechanism (the Node's EventEmitter module) **LiteClass** provides support for event-driven programming, as well. In fact, the base class itself is an EventEmitter, which indicates that the EventEmitter’s API is applies to the `LiteClass` instances too.

However, for convenience purposes **LiteClass** provide an additional API that acts as alias for the standard EventEmitter API, which includes:

- `.one` - same as `EventEmitter.prototype.once`,
- `.off(sType, fListener)` - Removes event listeners from this instance as follows:
	- if `fListener` argument is provided, it will be removed from the event listeners of type `sType`;
	- if only `sType` argument is provided all event listeners of type `sType` will be removed;
	- if no argument is provided, all event listeners of all types will be removed.


##### Predefined `change` events
Typically, when a *setter* member of the API described above modifies the value of a data field, it will also ‘trigger’ a `change` event. Thus, event listener objects can register shandlers for all types of `change` events of an instance, and they will be notified when a particular change occurs.

Registering for the `change` event of an instance, the listener will end up receiving notification on all changes, regardless of their type or the property or aggregation on which they occur. However, to monitor the change event of a particular property or aggregation, the event handler should register for an event identified as `change:<name>`, where `<name>` is the name of the property or aggregation of interest.

Moreover, as a change on an aggregation can be characterized by an action, such as `add`, `remove`, `removeLast`, `removeAt`, `insertsAt`, and `removeAll`, it is also possible to monitor and handle `change` events that occur as the result of one such action on a particular aggregation. The syntax for identifying and registering for such an event is `change:<name>:<action>`, where `<name>` is the name of the aggregation of interest, and `<action>` is one of the action types enumerated above.

##### Suppressing `change` events
As mentioned, triggering `change` events is the default behaviour of the *setter* members of the class. However, to override this behaviour, all the *setter* methods support a third parameter `bSupressEvent`, which is of type `boolean`. Its role is to indicate whether to allow or to prevent this behaviour during an individual call. Thus, by passing this argument as `true`, will prevent the object from triggering the `change` event.


### Example
The following section shows a very simple demo app that resembles a basic *ToDo List* and uses the ***LiteClass*** as the super-class of its classes. While it does not follow strictly the MVC pattern, it is meant to show how to define JS classes with ***LiteClass*** and how to instantiate them.
The first class, `View`, is a direct sub-class of the ***LiteClass*** . The role of this class is the render its internal state in HTML format.
The next two classes model the *ToDo* list and item objects, although, for the sake of simplicity they will also implement basic UI rendering capabilities (by sub-classing of `View` class), so that they will be able to render their internal state in HTML format. One of these classes is `ListItem`, which resembles a very simple *to do* item, and the other one is `List`, which is a collection of items (`ListItem` instances), resembling the simple *to do* list.

A live version of this demo could be found [here](https://run.plnkr.co/plunks/myrCHET3RYyNrAw8BV9f/).
