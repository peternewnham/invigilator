/**
 * Background message listeners
 */
(function(i) {

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

		console.group('Message received by background');
		console.log('message: ', message);
		console.log('sender: ', sender);
		console.groupEnd();

		switch (message.action) {

			/*
			 * Toggles the enabled/disabled event history logging
			 */
			case 'allowEnabledDisabledEvents':

				i.allowEnabledDisabledEvents = message.allow;

				sendResponse();

				break;

		}

		return true;

	});

})(Invigilator);