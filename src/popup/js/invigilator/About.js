/**
 * History tab functionality
 */
(function(i) {

	i.About = {

		/**
		 * Checks if there is a new update and shows the about tab if there is
		 */
		checkUpdate: function() {

			// check for update
			Invigilator.common.Settings.getLocal('newUpdate', function(newUpdate) {

				// there is a new update
				if (newUpdate) {

					// show the about tab
					$('.nav a:last').tab('show');

					// reset the newUpdate setting
					i.common.Settings.setLocal('newUpdate', false, function() {

						// clear the 'NEW' badge text
						chrome.browserAction.setBadgeText({
							text: ''
						});

					});
				}
			});

		}

	};

})(Invigilator);