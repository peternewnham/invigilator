(function(i) {

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

		console.group('Message received by popup');
		console.log('message: ', message);
		console.log('sender: ', sender);
		console.groupEnd();

		switch (message.action) {

			case 'updateItem':

				i.common.Extension.get(message.extensionId, function(liveExtension) {

					if (i.common.Extension.isDev(liveExtension)) {
						i.Installed.updateItem(liveExtension);
					}
					else {
						i.common.IndexedDB.getFromStore('extensions', liveExtension.id, function(storeExtension) {
							i.Installed.updateItem(storeExtension);
						});
					}

				});

			break;

			case 'uninstallItem':

				i.Installed.removeItem(message.extensionId);

			break;

		}

		i.History.filter();

		return true;

	});

})(Invigilator);