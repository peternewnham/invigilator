/**
 * IndexedDB helper methods
 */
(function(i) {

	i.common.IndexedDB = {

		/**
		 * The opened indexedDB object
		 * @var {IDBDatabase}
		 */
		db:	null,

		/**
		 * Database version number
		 */
		version: 1,

		/**
		 * Error handler
		 * @param e
		 */
		onerror: function(e) {

			// output error to console
			console.error(e);

			// log to analytics as well
			i.common.Analytics.event('IDB Error', e.message);

		},

		/**
		 * Opens and upgrades the db
		 * @param {Function} callback	Callback function once database is open and ready for use
		 */
		open: function(callback) {

			var _this = this;

			// open db
			var request = indexedDB.open('invigilator', _this.version);

			// if upgrading database
			request.onupgradeneeded = function(e) {

				console.log('Database update detected');

				var db = e.target.result;
				var transaction = e.target.transaction;

				transaction.onerror = _this.onerror;

				/**
				 * Creates a store in the idb
				 * @param {String} name		The store name
				 * @param {Object} options	Store options
				 * @returns {IDBObjectStore}
				 */
				var createStore = function(name, options) {

					// initialise store
					var store;

					// store doesn't yet exist in db
					if (!db.objectStoreNames.contains(name)) {

						// create it
						store = db.createObjectStore(name, options);

					}
					// store already exists
					else {

						// fetch it
						store = transaction.objectStore(name);

					}

					// return the store
					return store;

				};

				/**
				 * Creates an index on a store
				 * @param {IDBObjectStore} store	The store
				 * @param {String} name				Index name
				 * @param {Object} options			Index options
				 */
				var createIndex = function(store, name, options) {

					// if index doesn't yet exist
					if (!store.indexNames.contains(name)) {

						// create it
						store.createIndex(name, name, options);

					}

				};

				/*
				 * Extensions store
				 */

				// create store
				var extensionStore = createStore('extensions', {
					keyPath: 'id'
				});

				// add indices
				createIndex(extensionStore, 'name');
				createIndex(extensionStore, 'type');

				/*
				 * History store
				 */

				// create store
				var historyStore = createStore('history', {
					autoIncrement: true
				});

				// add indices
				createIndex(historyStore, 'extensionId');
				createIndex(historyStore, 'action');

			};

			// db open/create successfull
			request.onsuccess = function(e) {

				// log reference
				_this.db = e.target.result;

				// apply callback
				if (!!callback) {
					callback();
				}

			}

			// error handling
			request.onerror = this.onerror;

		},

		/**
		 * Fetches a store by name and sends it to a callback function
		 * @param {String} name			Name of store to fetch
		 * @param {Function} callback	Callback function
		 */
		getStore: function(name, callback) {

			var _this = this;

			/**
			 * Returns a store in the idb
			 * @returns {*}
			 */
			var getStore = function() {
				return _this.db.transaction([name], 'readwrite').objectStore(name);
			}

			// if db not yet open
			if (!this.db) {

				// open it first
				this.open(function() {

					// then get store and apply callback
					callback(getStore());
				});

			}
			// db already open
			else {

				// get store and apply callback
				callback(getStore());

			}

		},

		/**
		 * Loop through all the records in a store for a specific index
		 * @param {String} storeName	The store name
		 * @param {String} indexName	The index name
		 * @param {String} direction	The direction to loop
		 * @param {Function} callback	The callback to apply for each index found
		 */
		eachIndex: function(storeName, indexName, direction, callback) {

			var _this = this;

			// get the requested store
			this.getStore(storeName, function(store) {

				// create cursor for the idnex
				var cursor = store.index(indexName).openCursor(null, direction);

				// fetching success
				cursor.onsuccess = function(e) {

					// get current result
					var result = e.target.result;

					// if result exists
					if (!!result) {

						// apply callback with result
						callback(result.value);

						// move to next result
						result.continue();

					}

				};

				// error handling
				cursor.onerror = _this.onerror;

			});

		},

		/**
		 * Fetches an item from the store with the specified primary key
		 * @param {String} storeName	Store name
		 * @param {String} id			Primary key of record to get from store
		 * @param {Function} callback	Callback to apply once item is fetched
		 */
		getFromStore: function(storeName, id, callback) {

			var _this = this;

			console.log('IndexedDB.getFromStore:', storeName, '.', id);

			// get requested store
			this.getStore(storeName, function(store) {

				// create request
				var request = store.get(id);

				// request successful
				request.onsuccess = function(e) {

					// get result
					var result = e.target.result;

					// pass result and store to callback
					callback(result, store);

				};

				// request error
				request.onerror = function(e) {
					console.error('IndexedDB.getFromStore: Error fetching ', storeName, '.', id);
					_this.onerror(e);
				}

			});

		},

		/**
		 * Loop through each item in a store and pass it to callback
		 * @param {String} storeName	The name of the store to get all items from
		 * @param {Object} options		Request options
		 * @param {Function} callback	Callback function
		 */
		eachFromStore: function(storeName, options, callback) {

			console.log('IndexedDB.eachFromStore:', storeName, options);

			// get all items from the store
			this.getAllFromStore(storeName, options, function(items) {

				 // loop through each item
				for (var j=0, jlen=items.length; j<jlen; j++) {

					// apply callback
					callback(items[j]);

				}

			});

		},

		/**
		 * Returns all items from a specified store
		 * @param {String} storeName	The name of the store
		 * @param {Object} options		Request options
		 * @param {Function} callback	Callback function
		 */
		getAllFromStore: function(storeName, options, callback) {

			// initialise options
			options = options || {};

			console.log('IndexedDB.getAllFromStore:', storeName, options);

			// get store
			this.getStore(storeName, function(store) {

				// initialise items
				var items = [];

				// set direction
				var direction = options.direction || 'next';

				// use index if specified
				if (!!options.index) {
					store = store.index(options.index);
				}

				/*
				 * Range
				 */

				// default range
				var rangeType = 'lowerBound';
				var rangeValue = 0;

				// different range types
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

				// not starting from beginning
				if (start > 0) {

					// open the cursor at the requested start
					store.openCursor(range, direction).onsuccess = function(e) {
						var cursor = e.target.result;
						cursor.advance(start);
					};

				}

				// open cursor and start moving through items
				store.openCursor(range, direction).onsuccess = function(e) {

					// get cursor
					var cursor = e.target.result;

					// cursor still exists so there are more results
					if (!!cursor) {

						// if there is a limit and we have reached the end of the limit
						if (limit > 0 && items.length === limit) {

							// finish now and send items with callback
							callback(items);

						}
						// not end of limit yet
						else {

							// add current item to the list
							items.push(cursor.value);

							// go to next item
							cursor.continue();

						}

					}
					// cursor no longer exists
					// so must have reached end of results
					else {

						// send items with callback
						callback(items);

					}

				};

			});

		},

		/**
		 * Removes an item from the store with the specified primary key
		 * @param {String} storeName	Store name
		 * @param {String} id			Primary key of record to remove from store
		 * @param {Function} callback	Callback to apply once item is removed
		 */
		removeFromStore: function(storeName, id, callback) {

			var _this = this;

			console.log('IndexedDB.removeFromStore:', storeName, '.', id);

			// get requested store
			this.getStore(storeName, function(store) {

				// create request
				var request = store.delete(id);

				// request successful
				request.onsuccess = function(e) {

					// apply callback
					if (!!callback) {
						callback(true);
					}

				};

				// request error
				request.onerror = function(e) {

					// log
					console.error('IndexedDB.removFromStore: Error fetching ', storeName, '.', id);
					_this.onerror(e);

					// apply callback
					if (!!callback) {
						callback(false);
					}

				}

			});

		},

		/**
		 * Removes all records in a store from a specific index
		 * @param {String} storeName	The name of the store to remove from
		 * @param {String} indexName	The name of the index to remove
		 * @param {String} indexKey		The key of the index
		 * @param {Function} callback	Callback function once removing has completed
		 */
		removeByIndex: function(storeName, indexName, indexKey, callback) {

			var _this = this;

			console.log('IndexedDB.removeByIndex:', storeName, ', index:', indexName, ', key:', indexKey);

			// get store
			this.getStore(storeName, function(store) {

				// get index
				var index = store.index(indexName);

				// make request
				var indexStore = index.openKeyCursor(IDBKeyRange.only(indexKey));

				// request successful
				indexStore.onsuccess = function(e) {

					// get current result
					var cursor = indexStore.result;

					// if there is a result
					if (cursor) {

						// remove it
						store.delete(cursor.primaryKey);

						// go to the next one
						cursor.continue();

					}
					// no more results
					else {

						// apply callback if required
						if (!!callback) {
							callback(true);
						}

					}

				};

				// request error
				indexStore.onerror = function(e) {

					// log
					console.error('IndexedDB.removeByIndex: Error fetching ', storeName, ', index:', indexName, ', key:', indexKey);
					_this.onerror(e);

					// apply callback
					if (!!callback) {
						callback(false);
					}
				}

			});

		}

	};

	// open db connection immediately
	i.common.IndexedDB.open();

})(Invigilator);