// strict mode
"use strict";

var Invigilator = {};

/**
 * Initial set up - grab all extensions and add them to the data store
 */
chrome.runtime.onInstalled.addListener(function(details) {

	console.info('onInstalled event detected:', details.reason);

	if (details.reason === 'install') {

		Invigilator.common.Extension.each(function(extension) {

			if (!Invigilator.common.Extension.isDev(extension)) {

				Invigilator.Extension.storeAdd(extension, 'Already Installed');

			}

		});

	}

});

/**
 * Whenever an extension is installed/updated
 */
chrome.management.onInstalled.addListener(function(extensionInfo) {

	if (!Invigilator.common.Extension.isDev(extensionInfo)) {

		Invigilator.Extension.getFromStore(extensionInfo.id, function(extension) {

			// already exists
			if (!!extension) {

				var data = {};
				var action;

				// not unisntalled so being updated
				if (null === extension.dateUninstalled) {

					console.info('Extension Updated', extensionInfo.name, extensionInfo);

					data.dateUpdated = new Date();
					action = 'Updated';

					// send update notification
					i.Notify.update(extension);

				}
				// extension was previously uninstalled and now reinstalled
				else {

					console.info('Extension Reinstalled', extensionInfo.name, extensionInfo);

					data.dateInstalled = new Date();
					data.dateUpdated = null;
					data.dateUninstalled = null;

					action = 'Reinstalled';

				}

				Invigilator.Extension.storeUpdateRefresh(extension.id, data, action)

			}
			// does not exist
			else {

				console.info('Extension Installed', extensionInfo.name, extensionInfo);

				Invigilator.Extension.storeAdd(extensionInfo, 'Installed');

			}

		});

	}

});

chrome.management.onUninstalled.addListener(function(extensionId) {

	console.info('Extension Uninstalled:', extensionId);

	var sendMessage = function(extensionId) {
		chrome.runtime.sendMessage({
			action:			'uninstallItem',
			extensionId:	extensionId
		});
	};

	Invigilator.Extension.getFromStore(extensionId, function(extensionInfo) {

		// check extension exists and it's not a dev extension
		if (!!extensionInfo && !Invigilator.common.Extension.isDev(extensionInfo)) {

			Invigilator.Extension.storeUpdate(extensionId, {
				dateUninstalled: new Date()
			}, 'Uninstalled', function(){
				sendMessage(extensionId);
			});

		}
		else {

			sendMessage(extensionId);

		}

	});

});

chrome.management.onEnabled.addListener(function(extensionInfo) {

	console.info('Extension Enabled:', extensionInfo.name);

	var sendMessage = function(extensionId) {
		chrome.runtime.sendMessage({
			action:			'updateItem',
			extensionId:	extensionId
		});
	};

	if (!Invigilator.common.Extension.isDev(extensionInfo)) {

		Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: true }, 'Enabled', function(extension) {

			sendMessage(extension.id);

		});

	}
	else {

		sendMessage(extensionInfo.id);

	}

});

chrome.management.onDisabled.addListener(function(extensionInfo) {

	console.info('Extension Disabled:', extensionInfo.name);

	var sendMessage = function(extensionId) {
		chrome.runtime.sendMessage({
			action:			'updateItem',
			extensionId:	extensionId
		});
	};

	if (!Invigilator.common.Extension.isDev(extensionInfo)) {

		Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: false }, 'Disabled', function(extension) {

			sendMessage(extension.id);

		});

	}
	else {

		sendMessage(extensionInfo.id);

	}

});