LiteClass
==
<!--[![Build Status](https://github.com/luciVuc/LiteClass.git?branch=master)](https://github.com/luciVuc/LiteClass)-->

Small JS module that aims to facilitate object-oriented programming (OOP) in JavaScript by simplifying the process of creating and extending classes through prototypal inheritance.

###Installation Guide
**LiteClass** is designed to work both client-side (on the browser) and server-side (such as the Node.js environment).

Therefore, to use it on a client side web page, download a copy and reference it with a script tag, such as:
	
	```<script type="text/javascript" src="[path]/LiteClass/index.js"></script>```

where ```[path]``` is the path to the **LiteClass** folder on the local file system.

For the server-side (i.e. Node.js) environment, first install it with `NPM`,

	```npm install LiteClass```

then load it with the ```require``` function

	```var LiteClass = require('LiteClass');```

###Version:
`1.0.0`

###Description
From the user's perspective **LiteClass** is a simple JS constructor (function) enhanced with support for some basic OOP features, such as inheritance and data abstraction, as well as member definition (methods, static properties, instance data fields, etc.), built-in data field access control (through a generic API of *getters* and *setters*), and event triggering/handeling mechanism.
The role of this constructor is to serve as the *super-class* of all JS classes (constructors) in a project, so that all the instances of itself and the instances of its *sub-classes* inherit and share the same basic set of OOP features and capabilities.


###Inheritance
Due to inheritance, this *super-class* constructor has the ability of creating other JS constructors (functions) similar to itself. Thus, to support this functionality it implements a *static* function, called `extend`. The role of this function is to *extend* the class that *owns* it through the standard prototypal inheritance process in JS. Therefore, each new class or *sub-class* of the **LiteClass** *super-class* will *own* a version of the *static* function `extend`.


####Creating new classes
To create a new class we need to invoke the *static* function `extend` of the super-class (the class to extend), as in the following example:

		var MyClass = LiteClass.extend();
    
The succesful execution of this function will create and return a new class (constructor/function), which will be referenced by the `MyClass` variable. This class will be identical with its superclass (**LiteClass**, in this case), meaning that it will containing no additional data fields or functionality.

#####The ***class descriptor*** parameter
The *static* function `extend` does not have any required parameters. However, it supports a paramenter of type `object`, the `mOptions` or ***class descriptor*** parameter, which can contain the class definition options in a key-value pair (KVP) format. In other words, any additional functionality and/or data fields for the new class, could be passed to the *static* function `extend` inside this ***class descriptor*** argument.
Here is an example:

```js

	// create the new class with a **class descriptor** parameter
	var MyClass = LiteClass.extend({
		
		// the private data field of the class (data fields descriptor)
		"@private": {
	
		  // property descriptor
		  properties: {
		  },
		  
		  // aggregation descriptor
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

Although the options (properties) of the ***class descriptor*** parameter are optional, it does have two default options (`"@static"` and the `"@private"`) with predefined roles.

#####The `"@static"` property
The role of the `"@static"` option is to specify, also in a KVP manner, the *static* members of the class. These members (functions, constant values, etc.), similar to the `extend` function, will be attached to the class and will be accessible via the class name (not through an instance of the class).

#####The `"@private"` property
The role of the `"@private"` option is to specify the internal state of the class (its instance *data fields* along with their *descriptors*), also in a similar KVP manner, where the key is the name of the **data field** and the value is its corresponding ***data field descriptor***.

A ***data field descriptor*** is an object literal containing (in a KVP format) the options applicabile for defining a particular ***data field*** of the class.

A ***data field*** of the class, on the other hand, is a data element that defines the internal state of an instance of the class. Internally, it is backed up by a *private* instance variable, which should not be accessed directly by any code outside of the class definition. Instead, to access and/or modify a ***data field*** of an instance of the class should **only** be done through the predefined generic API of *setters* and *getters* available to all instances of a class.

Moreover, because a ***data field*** could either be a **property** (a type of ***data field*** that can store a single-value data), or an **aggregation** (a type of ***data field*** that can store a collection or reference multiple values of similar data type), the ***data field descriptors*** inside the `"@private"` option of the ***class descriptor*** parameter are split into:

	- `properties` - an object literal that holds the ***property descriptors*** (the ***data field descriptors*** for the *properties* of the class), and
	- `aggregations` - an object literal that holds the ***aggregation descriptors*** (the ***data field descriptors*** for the *aggregations* of the class).

Below is the basic structure of the `"@private"` option and its ***data field descriptor*** groups:

```js

	// ....
	// data fields descriptor
	"@private": {

	  // property descriptors
	  properties: {
	  	<<name>>: {
	  		defaultValue: null,
	  		validator: <<function>> // returs true if the argument is valid for this property
	  	}
	  },
	  
	  // aggregation descriptors
	  aggregations: {
	  	<<name>>: {
	  		validator: <<function>> // returs true if the argument is valid for this aggregation
	  	}
	  }
	}
```

The `<<name>>` placeholder, in the code snippet above, represents the name of the **data field** that particular ***data field descriptor*** describes, and its value is the object literal containing the set of applicabile *options* for defining it as a data field of the class.

#####The `validator` option
One of such options, applicable to both categories of data fields, is called `validator` and its value, referenced by the `<<function>>` placeholder, is a Boolean returning function. The role of this is function is to *validate* a value before assigning it to that data field. More specifically, it can be used to decide whether to accept or reject a given value before assigning it to that data field. Therefore, when providing a `validator` option it is very important to make sure that it’s value is a function that returns `true` if the argument it is called with is a valid value for that data field, or `false` otherwise. By default, the *`validator`* function returns `true` in any case, allowing any value to be assigned to that data field. 

#####The `defaultValue` option
Another definition *option* for a ***data field descriptor*** is called `defaultValue` and is applicable to the *property* types of ***data fields*** only. Its role is to hold a *default* value for that particular property, which will be used to initialize the property if the user does not provide an instantiation value. By default, the value of the `defaultValue` property of any ***property descriptor*** is `null`.

#####The `public` interface
All the other options (properties) of the ***class descriptor*** argument, including the user-defined ones, will be interpreted as the public interface of the class and will be attached to the its prototype. Therefore, they will be accessible only via an instance of the class.

#####Example
Here is an example of a simple class definition:

```js
		var Car = LiteClass.extend({
			// define the data fields
		  "@private": {
		  	properties: {
					make: {
						defaultValue: "",
						validator: function (arg) {
							return typeof arg === "string";
						}
					},
					model: {
						defaultValue: "",
						validator: function (arg) {
							return typeof arg === "string";
						}
					},
					year: {
						defaultValue: 1900,
						validator: function (arg) {
							return typeof arg === "number" && arg >= 1900 && arg <= 9999;
						}
					},
					color: {
						defaultValue: "",
						validator: function (arg) {
							return typeof arg === "string";
						}
					},
					mileage: {
						defaultValue: 0,
						validator: function (arg) {
							return typeof arg === "number" && arg >= 0;
						}
					},
					price: {
						defaultValue: 0,
						validator: function (arg) {
							return typeof arg === "number" && arg >= 0;
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

###Instantiation
####Creating instances of ***LiteClass*** type
To instantiate the `LiteClass` or one of its sub-classes we invoke constructor with the `new` keyword, as in the following example:

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
		});
		
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

After the execution of the statement above the variable `car` will reference an instance of type `LiteClass`. This is an example of object instantiated with the default values provided in ***class descriptor*** `"@private"` property.

#####Type checking support
Because the `LiteClass` instances are created using the `new` keyword, it is possible to check the type of an instance using the JS `instanceof` operator. Therefore, all the following statements are valid:

```js
		obj instanceof Car; // true
		obj instanceof LiteClass; // true

		var Plane = LiteClass.extend();
		obj instanceof Plane; // false
```


#####The `mSettings` argument
To instantiate a ***LiteClass*** type with user-defined values for its data fields, the default constructor supports an optional parameter, `mSettings`. This parameter is an object literal that passes to the constructor instantiation values for the predefined ***data fields*** of the class. In other words, each key of the `mSettings` object should match the name of a data field (*property* or *aggregation*) defined in the `"@private"` option of the ***class descriptor*** parameter. Any key in `mSettings` object that does not match the name of a ***data field*** will be ignored. Moreover, the value of each key in the `mSettings` parameter should be valid for its corresponding data field of the class, otherwise it will be rejected during validation and its default value used instead.

```js
		
		var car = new Car({
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
		});

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

####Data Field Access Control

Since the internal state or the *data fields* set of a `LiteClass` instance is backed up by *private* variables, which should not be accessed directly, part of the the base class's *public* interface is a set of *setter* and *getter* methods, which control the access and mutation of the values of its data fields. 

#####Reference
As a result, each instance of a `LiteClass` type *inherits* and gains access to the same set of data field access control methods, which include:
######Property access control:
  - `.getProperty(name)` - returns the value of the property `name`,
  - `.get(name)` - returns the value of the property or aggregation `name`,
  - `.setProperty(name, value)` - sets the argument `value`, if it is valid, to the property `name`,
  - `.set(name, value)` - sets the argument `value`, if it is valid, to the property `name`,
######Aggregation access control:
  - `.getAggregation(name)` - returns an array with the content of the aggregation `name`,
  - `.get(name)` - returns the value of the property or aggregation `name`,
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
  - `.insertAtAggregation(name, index, item, bSupressEvent)` - adds item `item` to the aggregation `name` at position `index`,
  - `.insertAt(name, index, item, bSupressEvent)` - adds item `item` to the aggregation `name` at position `index`,
  - `.removeAtAggregation(name, index, bSupressEvent)` - removes item `item` from the aggregation `name` at position `index`,
  - `.removeAt(name, index, bSupressEvent)` - removes item `item` from the aggregation `name` at position `index`,
  - `.removeAllAggregations(name, bSupressEvent)` - removes all items from the aggregation `name`
  - `.removeAll(name, bSupressEvent)` - removes all items from the aggregation `name`
######General-purpose:
  - `.applySettings(mSettings, mOptions)` - sets the values passed as key-value pairs in the `mSettings` associative array to the object's data fields defined in the aggregation and property descriptor objects. The `mOptions` argument can be used to pass the `bSupressEvent` option as a KVP with the key called `supressEvent`. Example: `obj.applySettings({}, {suppressEvent: true});`,
  - `.apply(mSettings, mOptions)` - sets the values passed as key-value pairs in the `mSettings` associative array to the object's data fields defined in the aggregation and property descriptor objects. The `mOptions` argument can be used to pass the `bSupressEvent` option as a KVP with the key called `supressEvent`. Example `obj.applySettings({}, {suppressEvent: true});`
  - `.clone()` - generates and returns a copy of the instance
######Static members:
  - `.extend(mConfig)` - creates a sub-class of an existing class of type `LiteClass`.

####Events
Through an ‘PubSub’ mechanism (the Node's EventEmitter module, if it is available, or a local integrated fallback version otherwise) **LiteClass** provides support for event triggering and handling, as well. In fact, the base class itself is an EventEmitter, which indicates that the EventEmitter’s API is applies to the `LiteClass` instances too. 

However, for convenience purposes **LiteClass** provide an additional API that acts as alias for the standard EventEmitter API, which includes:
	- `.addEventListener` -  same as `EventEmitter.prototype.addListener`,
	- `.one` - same as `EventEmitter.prototype.once`,
	- `.off(sType, fListener)` - Removes event listeners from this instance as follows:
			- if `fListener` argument is provided, it will be removed from the event listeners of type `sType`;
			- if only `sType` argument is provided all event listeners of type `sType` will be removed;
			- if no argument is provided, all event listeners of all types will be removed.

Typically, when a *setter* member of the API described above modifies the value of a data field, it will also ‘trigger’ a `change` event. Thus, one or more event listeners can registered handlers for all types of `change` events of an instance, and they will be notified when a particular change occurs.
Registering for the `change` event of an instance, the listener will end up receiving notification on all changes, regardless of their type or the property or aggregation on which they occur. However, to monitor the change event of a particular property or aggregation, the event handler should register for an event identified as `change:<<name>>`, where `<<name>>` is the name of the property or aggregation of interest.
Moreover, as a change on an aggregation can be characterized by an action, such as `add`, `remove`, `removeLast`, `removeAt`, `insertAt`, and `removeAll`, it is also possible to monitor and handle `change` events that occur as the result of one such action on a particular aggregation. The syntax for identifying and registering for such an event is `change:<<name>>:<<action>>`, where `<<name>>` is the name of the aggregation of interest and `<<action>>` is one of the
action types enumerated above.

As mentioned above, triggering `change` events is the default behaviour of the *setter* members of the class. However, to override this behaviour, all the *setter* methods support a third parameter `bSupressEvent`, which is of type `boolean`. Its role is to indicate whether to allow or to prevent this behaviour during an individual call. Thus, by passing this argument as `true`, will prevent the object from triggering the `change` event.


###Example
The following section shows a very simple demo app that resembles a basic *ToDo List* and uses the ***LiteClass*** as the super-class of its classes. It is meant to show how to define JS classes with ***LiteClass*** and how to instantiate them.
The first class, `View`, is a direct sub-class of the ***LiteClass*** . The role of this class is the render its internal state in HTML format.
The next two classes model the *ToDo* list and item objects, although, for the sake of simplicity they will also implement basic UI rendering capabilities (by sub-classing of `View` class), so that they will be able to render their internal state in HTML format. One of these classes is `ListItem`, which resembles a very simple *to do* item, and the other one is `List`, which is a collection of items (`ListItem` instances), resembling the simple *to do* list.

```js;

		var Class = window.LiteClass; // or `require("LiteClass")` if it is available;

		// 1. setup the namespace
		var app = window.app = {		
			class: {},
			view: {},
			controller: {},
			data: {}
		};

		// 2. Define a base class that can render its data in HTML format, so that it can be placed on the DOM.
		app.class.View = Class.extend({
			"@static": {
				/**
				 * @static
				 * Generates and returns an HTML element string by replacing in the templateHTML argument,
				 * the keys enclosed in the {{}} with the values of the same keys in the data argument.
				 *
				 * NOTE: In real life you should be using a templating engine such as Mustache or Handlebars,
				 * however, this is a vanilla JS example.
				 */
				template:  function (templateHTML, data, fn) {
					templateHTML = typeof templateHTML === "string" ? templateHTML : '';
					data = typeof data === "object" ? data : {};
					fn = typeof fn === "function" ? fn : function (v) {
						return v;
					};

					var view = templateHTML;

					for (var p in data) {
						if (typeof data[p] === "object") {
							view = fn(view, data[p]) || '';
						} else {
							view = view.replace('{{' + p + '}}', data[p]);
						}
					}
					return fn(view) || view;
				}
			},

			// Returns the internal state as an HTML element.
			// Additionally, it triggers a 'render' event, containing the source object and the resulting HTML string.
			// NOTE: Abstract method. Each sub-class should re-implement it.
			render: function (callback) {
				// a templating engine could help here...
				var event = {source: this, html: "This is the default renderer. The subclasses of this class should override it."};

				this.emit("render", event);
				if (typeof callback === "function") {
					callback(event);
				}
				return event.html;
			}
		});

		// 3. Create a simple class that models a **ListItem** object (such as a 'ToDo' item),
		//	 	and also implements the 'app.class.View.render' to display its content on the DOM
		app.class.ListItem = app.class.View.extend({
			// hash containing the **data field descriptors**
			"@private": {
				// property descriptors
				properties: {
					id: {
						defaultValue: 0,
						validator: function (arg) {
							// returns **true** only if **arg** is a positive number
							// (it could also be used to ensure a unique ID)
							return typeof arg === "number" && arg >= 0;
						}
					},
					title: {
						defaultValue: "",
						validator: function (arg) {
							// return **true** only if **arg** is a string
							return typeof arg === "string";
						}
					},
					body: {
						defaultValue: "",
						validator: function (arg) {
							// return **true** only if **arg** is a string
							return typeof arg === "string";
						}
					},
					done: {
						defaultValue: false,
						validator: function (arg) {
							// return **true** only if **arg** is a boolean value
							return typeof arg === "boolean";
						}
					}
				}
			},

			// the static members
			"@static": {
				ID_COUNTER: 0,

				TEMPLATE: '<li class="listItem" data-item="{{data}}">\
					<div><table>\
						<tr><th>ID :</th><td>{{id}}</td></tr>\
						<tr><th>Title :</th><td>{{title}}</td></tr>\
						<tr><th>Body :</th><td>{{body}}</td></tr>\
						<tr><th>Status :</th><td><input type="checkbox" class="statusChk" {{done}}> Done</td></tr>\
					</table></div>\
					<div>\
						<input type="button" class="btn editBtn" value="✎" title="Edit">\
						<input type="button" class="btn delBtn" value="✗" title="Delete"></div><hr></li>'
			},

			// called automatically during the instantiation
			initialize: function () {
				// can perform some additional instantiation steps
				return this;
			},

			// overrides the default constructor.
			// while it is highly recomended to implement the **initialize**  method instead,
			// this method can also be re-defined to control the instantiation propcess.
			constructor: function () {
				// However, if re-defined, it MUST call the constructor of its super-class as well: 
				return this.constructor.super_.apply(this, arguments);
			},

			// called automatically to perform some housekeeping steps when the object is destroyed.
			// Note: If re-defined it MUST call the **destroy** version of its super class as well.
			destroy: function () {
				// do cleanup steps, such as removing event listeners, and then call:
				this.constructor.super_.prototype.destroy.apply(this, arguments);  
			},

			// As example, here are some public methods:

			// returns whether the task is done or not.
			isDone: function () {
				return this.getProperty("done");
			},

			// return the internal state of the object as a JSON string
			toJsonString: function () {
				return JSON.stringify(this.toJSON());
			},

			// Returns the internal state as an HTML <LI> element.
			// Additionally, it triggers a 'render' event, containing the source object and the resulting HTML string.
			// (Implements the super-class version)
			render: function (callback) {
				var html = app.class.ListItem.TEMPLATE,
						data = this.toJSON(),
						event = null;

				data.done = data.done === true ? "checked" : "";
				data.data = escape(this.toJsonString());

				// a templating engine could help here...
				event = {source: this, html: app.class.View.template(html, data)};

				this.emit("render", event);
				if (typeof callback === "function") {
					callback(event);
				}
				return event.html;
			}
		});

		// 4. Create a simple class that models and displays a **List** object (such as a 'ToDo' list),
		//	 	and also implements the 'app.class.View.render' to display its content on the DOM
		app.class.List = app.class.View.extend({
			// hash containing the **data field descriptors** of the new class
			"@private": {
				// property descriptors
				properties: {

					// the title of the list
					caption: {
						defaultValue: "",
						validator: function (arg) {
							// return true only if **arg** is a string
							return typeof arg === "string";
						}
					}
				},

				// aggregation descriptors
				aggregations: {

					// a collection of items
					items: {
						validator: function (arg) {
							// return true only if **arg** is a (an instance of) app.class.ListItem
							return arg && arg instanceof app.class.ListItem;
						}
					}
				}
			},

			// the static members
			"@static": {
				// creates a TaskList object from an object literal
				load: function (data, changeCallback) {
					// maybe load the data with AJAX call 
					data = data || {};
					data.items = data.items || [];

					var items = [],
							List = app.class.List,
							ListItem = app.class.ListItem,
							list = new List({
								caption: data.caption
							});

					for (var i in data.items) {
						//data.items[i].id = ListItem.ID_COUNTER++;
						items.push(new ListItem(data.items[i]));
					}

					list.applySettings({items: items});

					if (typeof changeCallback === "function") {
						changeCallback(list);
					}
					return list;
				},

				TEMPLATE: '<section class="mainView">\
						<header><h3>SimpleDemo</h3><div><form id="editForm" class="editForm"><fieldset>\
							<legend>Item Editor</legend>\
							<input type="text" id="txtId" name="id" placeholder="ID" readonly">\
							<input type="text" id="txtTitle" name="title" placeholder="Title"><br/>\
							<textarea id="txtBody" name="body" placeholder="Body"></textarea><br/>\
							<input type="submit" title="Submit" id="submitBtn" value="✔">\
							<input type="reset" title="Reset" id="resetBtn" value="X">\</fieldset>\
							</form></div><hr/><h4>{{caption}}</h4><hr/></header>\
						<div class="listView"><ul>{{items}}</ul></div>\
					</section>'
			},

			// overrides the default constructor.
			constructor: function () {
				var args = arguments[0],
						ListItem = app.class.ListItem;

				args.items = args.items instanceof Array ? args.items : [];
				for (var i in args.items) {
					if (!(args.items[i] instanceof ListItem)) {
						args.items[1] = new ListItem(args.items[i]);
					}
				}
				this.on("change:items", this.render.bind(this));

				// call the superclass constructor as well
				this.constructor.super_.apply(this, arguments);
			},

			// methods:

			// returns the index of the item with **id**, or -1 otherwise
			getIndexOfItem: function (id) {
				var items = this.getAggregation("items");
				for (var i in items) {
					if (items[i].getProperty("id") === id) {
						return parseInt(i);
					}
				}
				return -1;
			},

			// returns the internal state of the object as JSON string.
			toJsonString: function () {
				return JSON.stringify(this.toJSON());
			},

			// Returns the internal state as an HTML <UL> element.
			// Additionally, it triggers a 'render' event, containing the source object and the resulting HTML string.
			// (Implements the super-class version)
			render: function (callback) {
				var html = app.class.List.TEMPLATE,
						data = this.toJSON(),
						item = null,
						event = null,
						str = "";

				// a templating engine could help here...
				for (var d in data.items) {
					item = data.items[d];
					str += item.render();
				}
				data.items = str;

				event = {source: this, html: app.class.View.template(html, data)};

				this.emit("render", event);
				if (typeof callback === "function") {
					callback(event);
				}
				return event.html;
			}
		});

		// 5. Define the app controller
		app.class.Controller = Class.extend({
			// delete button handler
			delBtnPressHandler: function (event) {
				var li = event.path ? event.path[2] : event.srcElement.parentElement.parentElement,
						data = JSON.parse(unescape(li.getAttribute("data-item")));
				if (confirm("Delete item " + data.id + ". Are you sure?")) {
					return this.removeAtAggregation("items", this.getIndexOfItem(data.id));
				}
				return null;
			},

			// edit button handler
			editBtnPressHandler: function (event) {
				var li = event.path ? event.path[2] : event.srcElement.parentElement.parentElement,
						data = JSON.parse(unescape(li.getAttribute("data-item")));
				
				this._$txtId.value = data.id;
				this._$txtTitle.value = data.title;
				this._$txtBody.value = data.body;
			},

			// save button handler
			saveBtnPressHandler: function saveBtnPressHandler() {
				var id = this._$txtId.value && Number(this._$txtId.value),
						itemIndex = app.view.list.getIndexOfItem(id),
						item = null;

				if (itemIndex >= 0) {
					item = app.view.list.getAggregationAt("items", itemIndex);
					item 
							.setProperty("title", this._$txtTitle.value, true)
							.setProperty("body", this._$txtBody.value);
					app.view.list.render();
				} else {
					app.view.list.addAggregation("items", new app.class.ListItem({
						id: this._$txtId.value || Number(new Date()), // app.view.list.getAggregation("items").length,
						title: this._$txtTitle.value,
						body: this._$txtBody.value    
					}));					
				}
				return false;
			},

			// reset button handler
			resetBtnPressHandler: function (event) {
				this._$txtId.value = this._$txtTitle.value = this._$txtBody.value = "";
			},

			// status checkbox handler
			statusBtnPressHandler: function (event) {
				var obj = event.target.parentElement.parentElement.parentElement,
						li = obj.parentElement.parentElement.parentElement,
						data = JSON.parse(unescape(li.getAttribute("data-item")));

				return this
						.getAggregationAt("items", this.getIndexOfItem(data.id), true)
						.setProperty("done", !data.done);
			},

			// list view rendering handler
			onListRender: function (event) {
				// event.source === this; --> true
				document.querySelector("#appView").innerHTML = event.html; // || listView.render();

				var editForm = event.source._$editForm = document.querySelector("#editForm"),
						submitBtn = event.source._$submitBtn = editForm.querySelector("#submitBtn"),
						resetBtn = event.source._$resetBtn = editForm.querySelector("#resetBtn"),
						delBtns = event.source._$delBtns = document.querySelectorAll(".delBtn"),
						editBtns = event.source._$editBtns = document.querySelectorAll(".editBtn"),
						statusChks = event.source._$statusChks = document.querySelectorAll(".statusChk"),
						b;

				event.source._$txtId = editForm.querySelector("#txtId");
				event.source._$txtTitle = editForm.querySelector("#txtTitle");
				event.source._$txtBody = editForm.querySelector("#txtBody");

				editForm.onsubmit = function () {
					return false;
				};

				submitBtn.addEventListener("click", app.class.Controller.prototype.saveBtnPressHandler.bind(event.source));
				resetBtn.addEventListener("click", app.class.Controller.prototype.resetBtnPressHandler.bind(event.source));

				for (b = 0; b < delBtns.length; b++) {
					delBtns[b].addEventListener("click", app.class.Controller.prototype.delBtnPressHandler.bind(event.source));
				}
				for (b = 0; b < editBtns.length; b++) {
					editBtns[b].addEventListener("click", app.class.Controller.prototype.editBtnPressHandler.bind(event.source));
				}
				for (b = 0; b < statusChks.length; b++) {
					statusChks[b].addEventListener("click", app.class.Controller.prototype.statusBtnPressHandler.bind(event.source));
				}
			},

			// 6. Define the app initialize function
			init: function () {
				this.constructor.super_.prototype.init.apply(this, arguments);
	
				// sample data
				var self = this,
						xhr = XMLHttpRequest ? new XMLHttpRequest() : new wnd.ActiveXObject("Microsoft.XMLHTTP");
				xhr.open("GET", './data/data.json', false);
				xhr.onreadystatechange = function () {
					if (this.readyState == 4 && this.status == 200) {
						app.data = JSON.parse(xhr.responseText);

						// 7. Create instances of these classes
						app.view.list = app.class.List.load(app.data, function (_list) {
							_list.on("render", self.onListRender);
							_list.render();
						});

						// 8. Setup 'add' event handlers
						app.view.list.on("change", function(event){
							console.log("The list content has changed.");
						});
						app.view.list.on("change:items", function(event){
							console.log("An item has been added or removed from the list.");
						});
						app.view.list.on("change:items:add", function(event){
							console.log("An 'add' action has occured on the list.");
						});

						// 9. Add a item to the aggreagtion "items" of the list
						app.view.list.addAggregation("items", new app.class.ListItem({
							id: 1476085826535,
							title: "Next step",
							body: "Have fun :)"    
						}));

					}
				};
				xhr.send();
			}
		});

		// 9. run the example app 
		window.addEventListener("load", function () {
			app.controller = new app.class.Controller();
		});

```

[![Here](https://run.plnkr.co/plunks/myrCHET3RYyNrAw8BV9f/)] is also a live version of this demo app.