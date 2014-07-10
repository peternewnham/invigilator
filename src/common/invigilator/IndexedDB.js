(function(i) {

	i.common.IndexedDB = {

		db:	null,

		version: 1,

		onerror: function(e) {
			console.error(e);
		},

		open: function(callback) {

			var _this = this;

			var request = indexedDB.open('invigilator', _this.version);

			request.onupgradeneeded = function(e) {

				console.log('Database update detected');

				var db = e.target.result;
				var transaction = e.target.transaction;

				transaction.onerror = _this.onerror;

				var createStore = function(name, options) {

					var store;

					if (!db.objectStoreNames.contains(name)) {
						store = db.createObjectStore(name, options);
					}
					else {
						store = transaction.objectStore(name);
					}

					return store;

				};

				var createIndex = function(store, name, options) {
					if (!store.indexNames.contains(name)) {
						store.createIndex(name, name, options);
					}
				};

				/*
				 * Extensions store
				 */

				var extensionStore = createStore('extensions', {
					keyPath: 'id'
				});

				createIndex(extensionStore, 'name');
				createIndex(extensionStore, 'type');

				/*
				 * History store
				 */

				var historyStore = createStore('history', {
					autoIncrement: true
				});

				createIndex(historyStore, 'extensionId');
				createIndex(historyStore, 'action');

			};

			request.onsuccess = function(e) {
				_this.db = e.target.result;
				if (!!callback) {
					callback();
				}
			}

			request.onerror = this.onerror;

		},

		getStore: function(name, callback) {

			var _this = this;

			var getStore = function() {
				return _this.db.transaction([name], 'readwrite').objectStore(name);
			}

			if (!this.db) {

				this.open(function() {
					callback(getStore());
				});

			}
			else {

				callback(getStore());

			}

		},

		eachIndex: function(storeName, indexName, direction, callback) {

			this.getStore(storeName, function(store) {

				var cursor = store.index(indexName).openCursor(null, direction);

				cursor.onsuccess = function(e) {

					var result = e.target.result;

					if (!!result) {

						callback(result.value);
						result.continue();

					}

				};

				cursor.onerror = function(e) {
					console.error(e);
				}

			});

		},

		getFromStore: function(storeName, id, callback) {

			console.log('IndexedDB.getFromStore:', storeName, '.', id);

			this.getStore(storeName, function(store) {

				var request = store.get(id);

				request.onsuccess = function(e) {

					var result = e.target.result;

					callback(result, store);

				};

				request.onerror = function(e) {
					console.error('IndexedDB.getFromStore: Error fetching ', storeName, '.', id);
					console.error(e);
				}

			});

		},

		eachFromStore: function(storeName, options, callback) {

			console.log('IndexedDB.eachFromStore:', storeName, options);

			this.getAllFromStore(storeName, options, function(items) {

				for (var j=0, jlen=items.length; j<jlen; j++) {

					callback(items[j]);

				}

			});

		},

		getAllFromStore: function(storeName, options, callback) {

			options = options || {};

			console.log('IndexedDB.getAllFromStore:', storeName, options);

			this.getStore(storeName, function(store) {

				var items = [];

				var direction = options.direction || 'next';

				/*
				 * Index
				 */
				if (!!options.index) {
					store = store.index(options.index);
				}

				/*
				 * Range
				 */

				// default
				var rangeType = 'lowerBound';
				var rangeValue = 0;

				if (!!options.range) {

					if (!!options.range.type) {
						rangeType = options.range.type;
					}

					if (!!options.range.value) {
						rangeValue = options.range.value;
					}

				}

				/*
				 * Paging
				 */
				var limit = parseInt(options.limit || 0, 10);
				var start = parseInt(options.start || 0, 10);

				var range = IDBKeyRange[rangeType](rangeValue);

				if (start > 0) {

					store.openCursor(range, direction).onsuccess = function(e) {
						var cursor = e.target.result;
						cursor.advance(start);
					};

				}

				store.openCursor(range, direction).onsuccess = function(e) {

					var cursor = e.target.result;

					if (!!cursor) {

						if (limit > 0 && items.length === limit) {
							callback(items);
						}
						else {
							items.push(cursor.value);
							cursor.continue();
						}

					}
					else {
						callback(items);
					}

				};

				/*store.openCursor(range, direction).onsuccess = function(e) {

					var cursor = e.target.result;

					if (!!cursor) {

						if (start > 0) {

							cursor.advance(start);
							start = 0;

						}
						else {

							if (limit > 0 && items.length === limit) {
								callback(items);
							}
							else {
								items.push(cursor.value);
								cursor.continue();
							}
						}

					}
					else {
						callback(items);
					}

				};*/

			});

		}

	};

	i.common.IndexedDB.open();

})(Invigilator);