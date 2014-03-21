(function(i) {

	i.Extension = {

		/**
		 * Returns the extensions data store from the idb
		 * @param callback
		 */
		getStore: function(callback) {

			i.common.IndexedDB.getStore('extensions', callback);

		},

		/**
		 * Returns a stored extension from the idb extension store
		 * @param id
		 * @param callback
		 */
		getFromStore: function(id, callback) {

			i.common.IndexedDB.getFromStore('extensions', id, callback);

		},

		/**
		 * Returns the requested live extension details
		 * @param id
		 * @param callback
		 */
		getLive: function(id, callback) {

			i.common.Extension.get(id, callback);

		},

		/**
		 * Scrapes the extension owner details from the chrome webstore
		 * @param id
		 * @param callback
		 */
		fetchOwner: function(id, callback) {

			// construct webstore url
			var webstoreUrl = 'https://chrome.google.com/webstore/detail/' + id;

			// try to fetch the webstore page
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {

				// page found
				if (this.status === 200) {

					// get h1 position
					// the owner element will be shortly after this
					var h1Index = this.responseText.search(/<h1/);

					var fromRegex = /from ([^<]+)/g;
					var currentMatch;

					var fromMatch = null;

					while (currentMatch = fromRegex.exec(this.responseText)) {
						if (currentMatch.index > h1Index) {
							fromMatch = currentMatch[1];
							break;
						}
					}

					callback(fromMatch);

				}
				// page not found - probably either a devmode
				else {

					console.error('Webstore fetch error:' + this.status);

					callback(null)

				}
			};
			xhr.open('GET', webstoreUrl, true);
			xhr.send();

		},

		fetchIconDataUrl: function(extension, callback) {

			var iconUrl = i.common.Extension.getIcon(extension, 48, false);

			if (iconUrl === i.common.Extension.DEFAULT_ICON) {
				callback(null);
			}
			else {

				var image = new Image;
				image.onload = function() {
					var canvas = document.createElement('canvas');
					canvas.width = this.width;
					canvas.height = this.height;
					var context = canvas.getContext('2d');
					context.drawImage(this, 0, 0);
					callback(canvas.toDataURL());
				};
				image.src = iconUrl;

			}

		},

		updateItem: function(extension, action, callback) {

			console.log('Extension.updateItem:', extension, action);

			// get store
			this.getStore(function(store) {

				var request = store.put(extension);

				request.onsuccess = function(e) {

					console.log('Extension.updateItem success:', extension.name);

					// log history
					i.History.log(extension, action, function() {

						if (typeof callback === 'function') {
							callback(extension, store);
						}

					});

				}

				request.onerror = function(e) {
					console.error('Extension.updateItem error', extension.name, e);
				}

			});

		},

		/**
		 * Adds a new extension data to the store
		 * @param extension
		 * @param action
		 */
		storeAdd: function(extension, action) {

			var _this = this;

			// add additional data
			extension.dateInstalled = new Date();
			extension.dateUninstalled = null;
			extension.dateUpdated = null;
			extension.owner = null;

			// get extension owner
			this.fetchOwner(extension.id, function(owner) {

				extension.owner = owner;

				_this.fetchIconDataUrl(extension, function(dataUrl) {

					extension.iconDataUrl = dataUrl;

					_this.updateItem(extension, action);

				});

			});

		},

		/**
		 * Update the store extension and refresh it's data from the live version
		 * @param extensionId
		 * @param data
		 * @param action
		 */
		storeUpdateRefresh: function(extensionId, data, action, callback) {

			console.log('Extension.storeUpdateRefresh:', extensionId, data, action);

			var _this = this;

			this.getFromStore(extensionId, function(storeExtension) {

				_this.getLive(extensionId, function(liveExtension) {

					if (!storeExtension) {
						storeExtension = liveExtension;
					}

					// update store extension data with live version
					for (var field in liveExtension) {
						storeExtension[field] = liveExtension[field];
					}

					// update additional fields
					if (!!data) {
						for (var field in data) {
							storeExtension[field] = data[field];
						}
					}

					// get extension owner
					_this.fetchOwner(extensionId, function(owner) {

						if (!!owner) {
							storeExtension.owner = owner;
						}

						// get data url
						_this.fetchIconDataUrl(extension, function(dataUrl) {

							if (!!dataUrl) {
								storeExtension.iconDataUrl = dataUrl;
							}

							_this.updateItem(storeExtension, action, callback);

						});

					});

				});

			});

		},

		/**
		 * Update the store but only the fields specified in data
		 * @param extensionId
		 * @param data
		 * @param action
		 */
		storeUpdate: function(extensionId, data, action, callback) {

			console.log('Extension.storeUpdate:', extensionId, data, action);

			var _this = this;

			this.getFromStore(extensionId, function(storeExtension) {

				// apply overrides
				if (!!data) {
					for (var field in data) {
						storeExtension[field] = data[field];
					}
				}

				_this.updateItem(storeExtension, action, callback);

			});

		}

	};

})(Invigilator);