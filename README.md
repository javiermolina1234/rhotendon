RhoTendon
=========

RhoTendon is a javascript library that links Backbone.js with Rhom, the RhoMobile ORM. It is implemented as an extension of Backbone models and collections that converts all calls to sync into calls to Rhom.

## Prerequisites

* RhoMobile 4.0
* Backbone.js 1.0.0
* rhoapi-modules.js (the new RhoMobile Javascript API introduced in 4.0)

## Usage

In order to include RhoTendon in your application:

* Place a copy of RhoTendon in your public/js folder
* Include a link to it in your layout file: `<script src="/public/js/rhotendon.js"></script>`
* Declare your RhoMobile ORM Model(s) in Javascript, as usual:

This step is the same whether you are using RhoTendon or not:

```javascript
var rhoProductModel = Rho.ORM.addModel(function(model) {
	model.modelName("Product");
	// Uncomment for RhoConnect integration
	// model.enable("sync");
	model.property("name", "string");
	model.property("brand", "string");
	model.property("price", "float");
	model.set("partition", "app");
});
```

This is the RhoTendon-specific part: extend from RhoTendon.Model instead of directly from Backbone.Model

```javascript
var Product = RhoTendon.Model.extend({
	ormModel: "Product", // identify the Rhom model this class represents
	mirrorAttributes: ["name", "brand"] // enumerate which attributes our Backbone model will care about
});
```

* ormModel must correspond to the name of a model as specified by `model.modelName`
* mirrorAttributes is an array containing all the attributes of your model. You can omit some if your Backbone.js code does not use them.

Optionally, you can extend RhoTendon.Collection:

```javascript
var ProductList = RhoTendon.ModelCollection.extend({
	model: Product,
});
```

This will let you access the complete list of Product items as a Backbone.js collection

## Additional features

RhoTendon includes a small utility class (`RhoTendon.FormHelper`) to help with CRUD forms. If you create input fields in a form with `name` attributes that match property names of your model, you can use `FormHelper` to quickly populate the form and/or get new values into a model object:

```html
<form id="product-edit-form">
	<label>Name: <input type="text" name="name"></label>
	<label>Brand: <input type="text" name="brand"></label>
</form>
```

You do not need to pre-populate the `value` attribute in your templates. Instead:

```javascript
var product = ....; // fetch a product or create a new one
var formHelper = new RhoTendon.FormHelper();
formHelper.fillForm($("#product-edit-form"), product, ["name","brand"]); // take the name and brand attributes from the model and put their values in the input elements with the same names

.... // show the form to the user

formHelper.updateModel(product, form, ["name","brand"]); // take the name and brand values from the form and update the model with them
```