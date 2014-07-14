/**
 * Manage history logging
 */
(function(i) {

	i.History = {

		/**
		 * Returns the history data store from the idb
		 * @param callback
		 */
		getStore: function(callback) {

			i.common.IndexedDB.getStore('history', callback);

		},

		/**
		 * Returns a stored history item from the idb extension store
		 * @param id
		 * @param callback
		 */
		getFromStore: function(id, callback) {

			i.common.IndexedDB.getFromStore('history', id, callback);

		},

		/**
		 * Object store for disabled history actions
		 * When reloading an extension it will fire the disable and enable events in quick succession so anything in this store
		 * will not have the disabled event logged for it
		 */
		disabledTimeout:	{},

		/**
		 * Logs a history item in the idb
		 * @param {Object} extension	The extension details
		 * @param {String} action		The action being logged
		 * @param {Function} callback	Callback after history has been added
		 */
		log: function(extension, action, callback) {

			/**
			 * extension id
			 * name
			 * action
			 * date
			 * version
			 * owner
			 * permissions
			 * hostPermissions
			 * enabled
			 */

			var _this = this;

			console.log('History.log:', extension, action);

			/**
			 * Logs a history item
			 */
			var log = function() {

				// get store
				_this.getStore(function(store) {

					// construct history object
					var obj = {
						extensionId:		extension.id,
						name:				extension.name,
						action:				action,
						date:				new Date(),
						version:			extension.version,
						owner:				extension.owner,
						permissions:		extension.permissions,
						hostPermissions:	extension.hostPermissions,
						enabled:			extension.enabled
					};

					// save it to the idb
					var request = store.put(obj);

					// save successful
					request.onsuccess = function(e) {

						console.log('History.log success:', extension.name);

						// apply callback
						if (typeof callback === 'function') {
							callback(extension, action);
						}

						// remove disabled timeout if exists
						if (action === i.Actions.DISABLED) {
							_this.disabledTimeout[extension.id] = null;
							delete _this.disabledTimeout[extension.id];
						}

					}

					// save unsuccessful
					request.onerror = function(e) {

						console.error('Extension.updateItem error', extension.name, e);

						// remove disabled timeout if exists
						if (action === i.Actions.DISABLED) {
							_this.disabledTimeout[extension.id] = null;
							delete _this.disabledTimeout[extension.id];
						}

					}

				});

			};

			// apply the save
			switch (action) {

				// Disabled
				case i.actions.DISABLED:

					// add to disabled timeout queue
					this.disabledTimeout[extension.id] = setTimeout(log, 100);

					break;

				// Enabled
				case i.actions.ENABLED:

					// if extension is in disabled timeout queue
					if (!!this.disabledTimeout[extension.id]) {

						// clear timeout and ignore - extension is being reloaded
						clearTimeout(this.disabledTimeout[extension.id]);
						delete this.disabledTimeout[extension.id];

						// apply callback
						callback(extension, action);

					}
					// not in disabled timeout queue
					else {

						// log it
						log();

					}
					break;

				// everything else
				default:

					// just log it
					log();
					break;

			}

		}

	};

})(Invigilator);