/**
 * Background specific extension management
 */

(function(i) {

	i.Extension = {

		/**
		 * The remove URL which caches extension information
		 */
		REMOTE_URL: 'http://invigilator.blarg.co.uk:3000/',

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
		 * Fetches additional data about the extension
		 * - owner - the owner of the extension
		 * - reviews - the number of reviews containing "spammy" keywords
		 * @param id
		 * @param callback
		 */
		fetchData: function(id, callback) {

			var _this = this;

			// generate url to query
			var url = this.REMOTE_URL + id;

			// try to fetch the webstore page
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {

				try {

					// page fetched successfully
					if (this.status === 200) {

						// get response json
						var json = JSON.parse(this.responseText);

						// response data exists
						if (json.success) {

							// send it to the callback
							callback(json);

						}
						// response data does not exist
						else {

							// get owner
							_this.fetchOwner(id, function(owner) {

								// get flagged reviews
								_this.fetchReviews(id, function(reviews) {

									// cache data for other users
									var xhr = new XMLHttpRequest();
									xhr.onload = function() {

										// page fetched successfully
										if (this.status === 200) {

											callback({
												owner: owner,
												reviews: reviews
											});

										}
										// page error - probably in devmode or server is down
										else {

											throw Error('Data submit error:' + this.status);

										}

									};

									// post request so it is cached for others
									xhr.open('POST', 'http://invigilator.blarg.co.uk:3000/' + id, true);
									var params = 'owner=' + (owner || '') + '&reviews=' + reviews;
									xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
									xhr.send(params);

								});

							});

						}

					}
					// page error
					else {

						throw(Error('Invalid response status code ' + this.status));

					}

				}
				// on error just assume there is no data
				catch (e) {
					console.error('Data fetch error:' + e);
					callback({
						owner: null,
						reviews: 0
					});
				}

			};
			xhr.open('GET', url, true);
			xhr.send();

		},

		/**
		 * Scrapes the owner data from the Chrome Store
		 * @param {String} id			The ID of the extension
		 * @param {Function} callback	Callback function to apply once the owner has been fetched
		 */
		fetchOwner: function(id, callback) {

			// try to fetch the webstore page
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {

				// page fetched successfully
				if (this.status === 200) {

					try {

						// get response text
						var body = this.responseText;

						// find h1 location
						var h1Index = body.search(/<h1/);

						if (h1Index < 0) {
							throw Error('No h1 tag found');
						}

						// remove all content before first h1
						// the owner element will be shortly after this
						body = body.substr(h1Index);

						// find text matching "from [owner]"

						var fromRegex = /from ([^<]+)/;
						var match = fromRegex.exec(body);

						if (!(match instanceof Array) || match.length < 2) {
							throw Error('No matches found');
						}

						callback(match[1]);

					}
					catch (e) {
						console.error(e);
						callback(null);
					}

				}
				// page error - probably in devmode or server is down
				else {

					console.error('Data fetch error:' + this.status);

					callback(null);

				}
			};
			xhr.open('GET', 'https://chrome.google.com/webstore/detail/' + id + '?source=' + chrome.runtime.id, true);
			xhr.send();

		},

		/**
		 * Fetches the number of reviews containing certain "spammy" keywords from the Chrome store
		 * @param {String} id			The ID of the extension
		 * @param {Function} callback	Callback to apply once the data has been fetched and processed
		 */
		fetchReviews: function(id, callback) {

			// number of reviews to get
			var reviewCount = 100;

			// spammy keywords to look out for
			var keywords = [
				' ads',
				' adverts',
				' adware',
				' spam',
				' spyware'
			];

			// try to fetch the webstore page
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {

				// page fetched successfully
				if (this.status === 200) {

					try {

						// review array is in annotations key, before numAnnotations
						// so we extract this string and then convert it to a real array
						var response = this.responseText.trim()
							.replace(/^[\w\W]+["']annotations["']:/, '')
							.replace(/,['"]numAnnotations['"]:[\w\W]+$/, '');

						var reviews = JSON.parse(response);

						if (!(reviews instanceof Array)) {
							throw Error('Reviews not array');
						}

						// initialise spam count
						var spamCount = 0;

						// loop through each review
						for (var i=0,ilen=reviews.length; i<ilen; i++) {

							// get current review and review comments
							var review = reviews[i];
							var comment = review.comment && String(review.comment).toLowerCase() || '';

							// check each keyword
							for (var j=0,jlen=keywords.length; j<jlen; j++) {

								var keyword = keywords[j];

								// if keyword is found then add it to the spam count
								if (comment.indexOf(keyword) >= 0) {

									spamCount++;
									break;
								}

							}

						}

						// apply callback
						callback(spamCount);

					}
					catch (e) {
						console.error(e);
						callback(-1);
					}

				}
				// page error - probably in devmode or server is down
				else {

					console.error('Reviews data fetch error:' + this.status);

					callback(-1);

				}
			};

			xhr.open('POST', 'https://chrome.google.com/reviews/components?source=' + chrome.runtime.id, true);

			// construct request parameters
			var req = {
				'appId': 94,
				'reqId': (new Date()).getTime() + '-0.38102638674899936',
				'hl': 'en',
				'js': true,
				'specs': [{
					'type': 'CommentThread',
					'url': encodeURIComponent('http://chrome.google.com/extensions/permalink?id=' + id),
					'groups': 'chrome_webstore',
					'sortby': 'date',
					'startindex': '0',
					'numresults': String(reviewCount),
					'restrictexpr': '%7B%5C%22restricts%5C%22%3A%20%5B%7B%5C%22name%5C%22%3A%20%5C%22language%5C%22%2C%20%5C%22stringValue%5C%22%3A%20%5C%22en%5C%22%2C%20%5C%22comparisonType%5C%22%3A%200%7D%5D%2C%20%5C%22restrictionType%5C%22%3A%200%7D',
					'id': '116'
				}],
				'internedKeys': [],
				'internedValues': []
			};

			var params = 'req=' + JSON.stringify(req);

			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.send(params);

		},

		/**
		 * Gets the dataurl string for an extension icon
		 * This is needed if the extension is uninstalled as we won't have access to it anymore
		 * @param {String} extensionId	The ID of the extension
		 * @param {Function} callback	The callback to call when the dataurl is fetched
		 */
		fetchIconDataUrl: function(extensionId, callback) {

			// get the icon url
			var iconUrl = i.common.Extension.getIcon(extensionId, 48, false);

			// using default icon so don't bother getting dataurl
			if (iconUrl === i.common.Extension.DEFAULT_ICON) {
				callback(null);
			}
			// extension has it's own icon
			else {

				// load it as an image object and then dump it into a canvas so the dataurl can be extracted
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

		/**
		 * Checks whether the owner of an extension has changed
		 * @param {Object} extension	Extension details
		 * @param {String} newOwner		Name of the new owner
		 */
		checkOwnerChange: function(extension, newOwner) {

			// new owner is present and different from the current one
			if (newOwner !== null && extension.owner !== newOwner) {

				// send owner change notification
				i.Notify.owner(extension);

				// save new owner
				this.storeUpdate(extension.id, {
					owner: newOwner
				}, i.Actions.OWNER_CHANGE);

			}

		},

		/**
		 * Checks all extensions for owner changes and bad reviews
		 */
		checkAllData: function() {

			var _this = this;

			// loop through each extension in the idb
			i.common.IndexedDB.eachFromStore('extensions', null, function(extension) {

				// only check installed extensions
				if (extension.dateUninstalled === null) {

					// fetch data
					_this.fetchData(extension.id, function(data) {

						console.log('Data checked:', extension.name, data);

						// check owner change
						if (data.owner) {

							_this.checkOwnerChange(extension, data.owner);

						}

						// if some bad reviews detected then notify the user
						if (data.reviews > 0) {

							i.Notify.reviews(extension, data.reviews);

						}

					});

				}

			});

		},

		/**
		 * Updates an extension in the idb and logs it in history
		 * @param {Object} extension	The extension data
		 * @param {String} action		The action being performed
		 * @param {Function} callback	Callback to apply once done
		 */
		updateItem: function(extension, action, callback) {

			console.log('Extension.updateItem:', extension, action);

			// get store
			this.getStore(function(store) {

				// save extension in idb
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
		 * @param {Object} extension	Extension data
		 * @param {String} action		The action being performed
		 */
		storeAdd: function(extension, action) {

			var _this = this;

			// add additional data
			extension.dateInstalled = new Date();
			extension.dateUninstalled = null;
			extension.dateUpdated = null;
			extension.owner = null;

			// get extension owner
			this.fetchData(extension.id, function(data) {

				extension.owner = data.owner;

				// get icon data url
				_this.fetchIconDataUrl(extension.id, function(dataUrl) {

					extension.iconDataUrl = dataUrl;

					// save item
					_this.updateItem(extension, action);

				});

			});

		},

		/**
		 * Update the store extension and refresh it's data from the live version
		 * @param {String} extensionId	The extension ID
		 * @param {Object} data			Additional data to save against the extension
		 * @param {String} action		The action being performed
		 * @param {Function} callback	Callback to call once done
		 */
		storeUpdateRefresh: function(extensionId, data, action, callback) {

			console.log('Extension.storeUpdateRefresh:', extensionId, data, action);

			var _this = this;

			// get extension data from the idb
			this.getFromStore(extensionId, function(storeExtension) {

				// then get "live" extension data from the chrome api
				_this.getLive(extensionId, function(liveExtension) {

					// is store extension doesn't exist then use the live extension
					if (!storeExtension) {
						storeExtension = liveExtension;
					}

					// update store extension data with live version
					for (var field in liveExtension) {
						storeExtension[field] = liveExtension[field];
					}

					// update additional fields if set
					if (!!data) {
						for (var field in data) {
							storeExtension[field] = data[field];
						}
					}

					// get extension owner
					_this.fetchData(extensionId, function(data) {

						// owner exists
						if (!!data && !!data.owner) {

							// check for owner change
							if (action === i.Actions.UPDATED) {
								_this.checkOwnerChange(storeExtension, data.owner);
							}

							storeExtension.owner = data.owner;

						}

						// get data url
						_this.fetchIconDataUrl(extensionId, function(dataUrl) {

							if (!!dataUrl) {
								storeExtension.iconDataUrl = dataUrl;
							}

							// update extension in idb
							_this.updateItem(storeExtension, action, callback);

						});

					});

				});

			});

		},

		/**
		 * Update the store but only the fields specified in data
		 * @param {String} extensionId	The extension ID
		 * @param {Object} data			The data to save against the extension
		 * @param {String} action		The action being performed
		 * @param {Function} callback	Callback to call once done
		 */
		storeUpdate: function(extensionId, data, action, callback) {

			console.log('Extension.storeUpdate:', extensionId, data, action);

			var _this = this;

			// get extension data from the idb
			this.getFromStore(extensionId, function(storeExtension) {

				// apply overrides
				if (!!data) {
					for (var field in data) {
						storeExtension[field] = data[field];
					}
				}

				// update item
				_this.updateItem(storeExtension, action, callback);

			});

		}

	};

})(Invigilator);