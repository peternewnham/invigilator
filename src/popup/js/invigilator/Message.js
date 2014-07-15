/**
 * Message processing
 */
(function(i) {

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

		console.group('Message received by popup');
		console.log('message: ', message);
		console.log('sender: ', sender);
		console.groupEnd();

		switch (message.action) {

			/*
			 * Exension has been updated
			 */
			case 'updateItem':

				// get the "live" extension details
				i.common.Extension.get(message.extensionId, function(liveExtension) {

					// extension is a dev extension
					if (i.common.Extension.isDev(liveExtension)) {

						// update it's entry with the live data
						i.Installed.updateItem(liveExtension);

					}
					// not a dev extension
					else {

						// get the extension store data
						i.common.IndexedDB.getFromStore('extensions', liveExtension.id, function(storeExtension) {

							// update it's entry with the store data
							i.Installed.updateItem(storeExtension);

						});
					}

				});

			break;

			/*
			 * Extension has been uninstalled
			 */
			case 'uninstallItem':

				// remove it's entry
				i.Installed.removeItem(message.extensionId);

				// update uninstalled tab
				i.Uninstalled.generate();

			break;

		}

		// update the history
		i.History.filter();

		return true;

	});

})(Invigilator);