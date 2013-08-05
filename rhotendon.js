(function(){
	var root = this;

	var previousRhoTendon = root.RhoTendon;

	var RhoTendon;

	RhoTendon = root.RhoTendon = {};
	
	RhoTendon.VERSION = '0.0.1';

	RhoTendon.noConflict = function() {
		root.RhoTendon = previousRhoTendon;
		return this;
	}

	var Model = RhoTendon.Model = Backbone.Model.extend({
		ormModel: null,
		mirrorAttributes: [],
		constructor: function(attributes) {
			this.creationDate = Date.now();

			this.on("change:$rhoModel", function(model) {
				model._from_rhomodel();
			});

			Backbone.Model.apply(this, arguments);

			if (typeof(this.ormModel)==="string") {
				this.ormModel = Rho.ORM.getModel(this.ormModel);
			}

		},
		getRhoModel: function() {
			return this.get("$rhoModel");
		},
		mirrorAttributes: [],
		sync: function(method, model, options) {

			switch (method) {
			case "create":
				options.success({$rhoModel : this.ormModel.create(model.attributes)});
				break;

			case "read": 

				var rhoModel = this.ormModel.find("first", {
					conditions: {"object": model.id}
				});

				options.success({$rhoModel : rhoModel});
				break;

			case "update":
				model._to_rhomodel();
				model.getRhoModel().save();

				options.success({$rhoModel : model.getRhoModel()});
				break;

			case "delete":
				model.getRhoModel().destroy();
				options.success();
				break;

			default:
				alert("Unimplemented method " + method + " called in RhoTendon.Model.sync");
			}

		},
		_from_rhomodel: function() {
			var rhoModel = this.getRhoModel();
			this.set("id", rhoModel.object());
			for (var i = 0; i < this.mirrorAttributes.length; i++) {
				
				var key = this.mirrorAttributes[i];
				var value = rhoModel.get(key);

				this.set(key, value);
			}
		},
		_to_rhomodel: function() {
			var rhoModel = this.getRhoModel();

			for (var i = 0; i < this.mirrorAttributes.length; i++) {

				var key = this.mirrorAttributes[i];
				var value = this.get(key);

				rhoModel.set(key, value);
			}
		}
	});	

	var ModelCollection = RhoTendon.ModelCollection = Backbone.Collection.extend({
		model: null,

		sync: function(method, model, options) {
			switch (method) {
			case "read":
				var result = [];

				var allModels = this.model.prototype.ormModel.find("all");

				for (var i = 0; i < allModels.length; i++) {
					var model = allModels[i];
					result.push({ $rhoModel: model });
				}

				if (options.success) {
					options.success(result);
				}
				break;
			default:
				alert("Unimplemented method " + method + " in RhoTendon.ModelCollection.sync");
			}
		}
	});


	var FormHelper = RhoTendon.FormHelper = {
			fillForm: function(form,model,mirrorAttributes) {
				if (model) {
					for(var i=0; i < mirrorAttributes.length; i++) {
						var key = mirrorAttributes[i];
						var field = $(form).find("input[name="+key+"]");
						field.val(model.get(key));							
					}
				}
			},
			updateModel: function(model,form,mirrorAttributes) {
				var new_values = {};
				for(var i=0; i < mirrorAttributes.length; i++) {
					var key = mirrorAttributes[i];
					var value = $(form).find("input[name="+key+"]").val();
					new_values[key] = value;
				}
				model.set(new_values);
			}
	};

	FormHelper.extend = Backbone.Model.extend;
}).call(this);
