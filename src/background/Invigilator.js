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

	/*
	 * First install
	 */
	if (details.reason === 'install') {

		// load default settings
		Invigilator.common.Settings.init();

		// store each extension
		Invigilator.common.Extension.each(function(extension) {

			// ignore dev extensions
			if (!Invigilator.common.Extension.isDev(extension)) {

				// add it to the store
				Invigilator.Extension.storeAdd(extension, Invigilator.Actions.ALREADY_INSTALLED);

			}

		});

		// track install event
		Invigilator.common.Analytics.event('Run', 'Install');

	}
	/*
	 * Update
	 */
	else if (details.reason === 'update') {

		// track update event
		Invigilator.common.Analytics.event('Run', 'Update');

		// set new update browser action badge
		Invigilator.common.Settings.setLocal('newUpdate', true, function() {
			chrome.browserAction.setBadgeText({
				text: 'NEW'
			});
		});

		// save and notify update
		Invigilator.common.Extension.get(chrome.runtime.id, function(extension) {
			onInstalledCallback(extension);
		});

	}

	// start allowing enable/disable events
	Invigilator.allowEnabledDisabledEvents = true;

	// track page view
	Invigilator.common.Analytics.pageview('background.html', 'Background');

	// set alarms
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

	// track run event
	Invigilator.common.Analytics.event('Run', 'Open');

	// set alarms
	Invigilator.Alarms.setAlarms();

	// set new update action badge
	Invigilator.common.Settings.getLocal('newUpdate', function(newUpdate) {
		// only set it if there is a new update
		if (newUpdate) {
			chrome.browserAction.setBadgeText({
				text: 'NEW'
			});
		}
	});

});

var onInstalledCallback = function(extensionInfo) {

	// ignore dev extensions
	if (!Invigilator.common.Extension.isDev(extensionInfo)) {

		// get the extension from the store
		Invigilator.Extension.getFromStore(extensionInfo.id, function(extension) {

			// already exists - update or reinstall
			if (!!extension) {

				var data = {};
				var action;

				// not unisntalled so being updated
				if (null === extension.dateUninstalled) {

					console.info('Extension Updated', extensionInfo.name, extensionInfo);

					data.dateUpdated = new Date();
					action = Invigilator.Actions.UPDATED;

					// send update notification
					Invigilator.Notify.update(extensionInfo);

				}
				// extension was previously uninstalled and now reinstalled
				else {

					console.info('Extension Reinstalled', extensionInfo.name, extensionInfo);

					data.dateInstalled = new Date();
					data.dateUpdated = null;
					data.dateUninstalled = null;

					action = Invigilator.Actions.REINSTALLED;

				}

				// update store from live extension data
				Invigilator.Extension.storeUpdateRefresh(extension.id, data, action)

			}
			// does not exist - first time install
			else {

				console.info('Extension Installed', extensionInfo.name, extensionInfo);

				// add to store
				Invigilator.Extension.storeAdd(extensionInfo, Invigilator.Actions.INSTALLED);

			}

		});

	}

};

/**
 * Whenever an extension is installed/updated
 */
chrome.management.onInstalled.addListener(onInstalledCallback);

/**
 * Whenever an extension is uninstalled
 */
chrome.management.onUninstalled.addListener(function(extensionId) {

	console.info('Extension Uninstalled:', extensionId);

	/**
	 * Sends a message informing of the extension uninstall
	 * @param extensionId
	 */
	var sendMessage = function(extensionId) {
		chrome.runtime.sendMessage({
			action:			'uninstallItem',
			extensionId:	extensionId
		});
	};

	// get extension from store
	Invigilator.Extension.getFromStore(extensionId, function(extensionInfo) {

		// if extension exists and it's not a dev extension
		if (!!extensionInfo && !Invigilator.common.Extension.isDev(extensionInfo)) {

			// update extension info
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

/**
 * Whenever an extension is enabled
 */
chrome.management.onEnabled.addListener(function(extensionInfo) {

	// if allowing enabled events
	if (Invigilator.allowEnabledDisabledEvents) {

		console.info('Extension Enabled:', extensionInfo.name);

		/**
		 * Sends a message informing about the extension enable
		 * @param extensionId
		 */
		var sendMessage = function(extensionId) {
			chrome.runtime.sendMessage({
				action:			'updateItem',
				extensionId:	extensionId
			});
		};

		// if not dev extension
		if (!Invigilator.common.Extension.isDev(extensionInfo)) {

			// update in store
			Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: true }, Invigilator.Actions.ENABLED, function(extension) {

				sendMessage(extension.id);

			});

		}
		// dev extension
		else {

			sendMessage(extensionInfo.id);

		}

	}

});

/**
 * Whenever an extension is disabled
 */
chrome.management.onDisabled.addListener(function(extensionInfo) {

	// if allowing enabled events
	if (Invigilator.allowEnabledDisabledEvents) {

		console.info('Extension Disabled:', extensionInfo.name);

		/**
		 * Sends a message informing about the extension disable
		 * @param extensionId
		 */
		var sendMessage = function(extensionId) {
			chrome.runtime.sendMessage({
				action:			'updateItem',
				extensionId:	extensionId
			});
		};

		// if not a dev extension
		if (!Invigilator.common.Extension.isDev(extensionInfo)) {

			// update store
			Invigilator.Extension.storeUpdate(extensionInfo.id, { enabled: false }, Invigilator.Actions.DISABLED, function(extension) {

				sendMessage(extension.id);

			});

		}
		// dev extension
		else {

			sendMessage(extensionInfo.id);

		}

	}

});

// set error handling
window.onerror = function(message, url, linenumber) {
	Invigilator.common.Util.logError(message, url, linenumber);
}