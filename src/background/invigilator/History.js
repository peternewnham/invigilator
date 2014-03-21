(function(i) {

	i.History = {

		/**
		 * Returns the extensions data store from the idb
		 * @param callback
		 */
		getStore: function(callback) {

			i.common.IndexedDB.getStore('history', callback);

		},

		/**
		 * Returns a stored extension from the idb extension store
		 * @param id
		 * @param callback
		 */
		getFromStore: function(id, callback) {

			i.common.IndexedDB.getFromStore('history', id, callback);

		},

		disabledTimeout:	{},

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

			if (action === 'Disabled') {

			}

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

					var request = store.put(obj);

					request.onsuccess = function(e) {

						console.log('History.log success:', extension.name);

						if (typeof callback === 'function') {
							callback(extension, action);
						}

						if (action === 'Disabled') {
							_this.disabledTimeout[extension.id] = null;
						}

					}

					request.onerror = function(e) {

						console.error('Extension.updateItem error', extension.name, e);

						if (action === 'Disabled') {
							_this.disabledTimeout[extension.id] = null;
						}

					}

				});

			};

			switch (action) {
				case 'Disabled':
					this.disabledTimeout[extension.id] = setTimeout(log, 100);
					break;
				case 'Enabled':
					if (!!this.disabledTimeout[extension.id]) {
						clearTimeout(this.disabledTimeout[extension.id]);
						delete this.disabledTimeout[extension.id];
						callback(extension, action);
					}
					else {
						log();
					}
					break;
				default:
					log();
			}

		}

	};

})(Invigilator);