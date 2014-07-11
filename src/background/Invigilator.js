// strict mode
"use strict";

var Invigilator = {

	/**
	 * Don't do anything for enable/disable events by default
	 * When chrome is first loaded all extension will have their enabled events fired
	 */
	allowEnabledDisabledEvents: false

};

/**
 * Initial set up - grab all extensions and add them to the data store
 */
chrome.runtime.onInstalled.addListener(function(details) {

	console.info('onInstalled event detected:', details.reason);

	/**
	 * First install
	 */
	if (details.reason === 'install') {

		// load default settings
		Invigilator.common.Settings.init();

		// store each extension
		Invigilator.common.Extension.each(function(extension) {

			if (!Invigilator.common.Extension.isDev(extension)) {

				Invigilator.Extension.storeAdd(extension, Invigilator.Actions.ALREADY_INSTALLED);

			}

		});

	}

	// start allowing enable/disable events
	Invigilator.allowEnabledDisabledEvents = true;

	// track page view
	Invigilator.common.Analytics.pageview('background.html', 'Background');

	Invigilator.Alarms.setAlarms();

});

/**
 * Start up
 */
chrome.runtime.onStartup.addListener(function() {

	console.info('onStartup event detected');

	// start allowing enable/disable events
	Invigilator.allowEnabledDisabledEvents = true;

	// track page view
	Invigilator.common.Analytics.pageview('background.html', 'Background');

	Invigilator.Alarms.setAlarms();

});

/**
 * Whenever an extension is installed/updated
 */
chrome.management.onInstalled.addListener(function(extensionInfo) {

	// ignore dev extensions
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
					action = Invigilator.Actions.UPDATED;

					// send update notification
					i.Notify.update(extension);

				}
				// extension was previously uninstalled and now reinstalled
				else {

					console.info('Extension Reinstalled', extensionInfo.name, extensionInfo);

					data.dateInstalled = new Date();
					data.dateUpdated = null;
					data.dateUninstalled = null;

					action = Invigilator.Actions.REINSTALLED;

				}

				Invigilator.Extension.storeUpdateRefresh(extension.id, data, action)

			}
			// does not exist
			else {

				console.info('Extension Installed', extensionInfo.name, extensionInfo);

				Invigilator.Extension.storeAdd(extensionInfo, Invigilator.Actions.INSTALLED);

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
			}, Invigilator.Actions.UNINSTALLED, function(){
				sendMessage(extensionId);
			});

		}
		else {

			sendMessage(extensionId);

		}

	});

});

chrome.management.onEnabled.addListener(function(extensionInfo) {

	if (Invigilator.allowEnabledDisabledEvents) {

		console.info('Extension Enabled:', extensionInfo.name);

		var sendMessage = function(extensionId) {
			chrome.runtime.sendMessage({
				action:			'updateItem',
				extensionId:	extensionId
			});
		};

		if (!Invigilator.common.Extension.isDev(extensionInfo)) {

			Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: true }, Invigilator.Actions.ENABLED, function(extension) {

				sendMessage(extension.id);

			});

		}
		else {

			sendMessage(extensionInfo.id);

		}

	}

});

chrome.management.onDisabled.addListener(function(extensionInfo) {

	if (Invigilator.allowEnabledDisabledEvents) {

		console.info('Extension Disabled:', extensionInfo.name);

		var sendMessage = function(extensionId) {
			chrome.runtime.sendMessage({
				action:			'updateItem',
				extensionId:	extensionId
			});
		};

		if (!Invigilator.common.Extension.isDev(extensionInfo)) {

			Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: false }, Invigilator.Actions.DISABLED, function(extension) {

				sendMessage(extension.id);

			});

		}
		else {

			sendMessage(extensionInfo.id);

		}

	}

});