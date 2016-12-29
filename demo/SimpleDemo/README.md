SimpleDemo JS App

A very simple demo app that resembles a basic *To-Do List* and uses the ***LiteClass*** as the super-class of its classes. While it does not follow strictly the MVC pattern, it is meant to show how to define JS classes with ***LiteClass*** and how to instantiate them.
The first class, `View`, is a direct sub-class of the ***LiteClass*** . The role of this class is the render its internal state in HTML format.
The next two classes model the *To-Do* list and item objects, although, for the sake of simplicity they will also implement basic UI rendering capabilities (by sub-classing of `View` class), so that they will be able to render their internal state in HTML format. One of these classes is `ListItem`, which resembles a very simple *to do* item, and the other one is `List`, which is a collection of items (`ListItem` instances), resembling the simple *to do* list.

A live version of this demo could be found [here](https://run.plnkr.co/plunks/myrCHET3RYyNrAw8BV9f/).
