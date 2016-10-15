/*jslint browser: true, node: true, white: false, nomen: false, sloppy: false, stupid: false, vars: true, esnext: true*/
  
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
					<input type="text" id="txtId" name="id" placeholder="ID" readonly>\
					<input type="text" id="txtTitle" name="title" placeholder="Title"><br/>\
					<textarea id="txtBody" name="body" placeholder="Body"></textarea><br/>\
					<input type="submit" title="Submit" id="submitBtn" value="✔">\
					<input type="reset" title="Reset" id="resetBtn" value="X">\</fieldset>\
					</form></div><hr/><h4>{{caption}} ({{count}})</h4><hr/></header>\
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

		data.count = data.items.length;
		
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

	ajax: function (url, callback) {
		url = typeof url === "string" ? url : "";
		callback = typeof callback === "function" ? callback : undefined;
		
		var xhr = XMLHttpRequest ? new XMLHttpRequest() : new wnd.ActiveXObject("Microsoft.XMLHTTP");
		xhr.open("GET", url, false);
		xhr.onreadystatechange = callback;
		xhr.send();
		return this;
	},

	// 6. Define the app initialize function
	init: function () {
		this.constructor.super_.prototype.init.apply(this, arguments);
	
		var self = this;
		// load sample data
		return this.ajax('./data/data.json', function () {
			if (this.readyState === 4 && this.status === 200) {
				app.data = JSON.parse(this.responseText);

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
					id: Number(new Date()),
					title: "Final step",
					body: "Enjoy",
					done: true
				}));
			}
    });
	}
});

// 9. run the example app 
window.addEventListener("load", function () {
	app.controller = new app.class.Controller();
});