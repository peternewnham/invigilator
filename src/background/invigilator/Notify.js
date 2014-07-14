/**
 * Notification management
 */
(function(i) {

	i.Notify = {

		/**
		 * Buttons to add to the notifications
		 */
		buttons: {
			IGNORE_ONE_MONTH: {
				title:	'Ignore for this extension for 1 month',
				iconUrl: 'images/notification-btn-ignore.png'
			},
			IGNORE_FOREVER: {
				title:	'Ignore for this extension forever',
				iconUrl: 'images/notification-btn-ignore.png'
			}
		},

		/**
		 * Notification callback store
		 * Each notification will have callbacks associated with it which will be stored here with the notification id as the key
		 */
		notifications: {},

		/**
		 * Returns the Date in international format
		 * @returns {String}
		 */
		getDate: function() {

			return moment(new Date).format('LLLL');

		},

		/**
		 * Creates a notification
		 * @param {Object} options
		 * 		name				- {String}	- name of the notification type (used for logging)
		 * 		extensionId 		- {String}	- extension id notification is for
		 * 		extensionName		- {String}	- name of the extension the notification is for
		 * 		showKey				- {String}	- name of the key used to get whether the notification should be shown
		 * 		exclusionKey		- {String}	- name of the key used to get whether the extension is excluded from notifications
		 * 		clickType			- {String}	- The action to perform when the notification is clicked (it's onClicked event)
		 * 		notificationId		- {String}	- The ID of the notication
		 * 		notificationOptions	- {Object}	- Notification options as defined by the extension api
		 */
		showNotification: function(options) {

			var _this = this;

			// check notifications are allowed
			chrome.notifications.getPermissionLevel(function(level) {

				// if allowed
				if (level === 'granted') {

					// get whether this type of notification is allowed
					i.common.Settings.getSync(options.showKey, function(show) {

						// if this type of notification is allowed
						if (show) {

							console.info(options.name, ' notifications enabled');

							// get exclusions
							i.common.Settings.getSync(options.exclusionKey, function(exclusions) {

								// assume not ignored
								var ignore = false;

								// if extension has an exclusion
								if (exclusions.hasOwnProperty(options.extensionId)) {

									// get exclusion details
									var exclusion = exclusions[options.extensionId];
									var name = exclusion.name;
									var date = exclusion.date;

									// indefinite exclusion
									if (false === date) {

										console.warn('Ignoring ' + options.name + ' notifications for \'' + name + '\': forever');

										ignore = true;

									}
									// expiring exclusion
									else {

										var now = new Date();

										// exlusion expiring in future so don't show notification
										if (date > now) {

											console.warn('Ignoring ' + options.name + ' notifications for \'' + name + '\': until ', (new Date(date)));

											ignore = true;

										}
										// exclusion in past so remove it
										else {

											i.common.Settings.removeExclusion(options.exclusionKey, options.extensionId);

										}

									}

								}

								// not ignoring exclusion
								if (!ignore) {

									// clear existing notification if it already exists
									_this.clearNotification(options.notificationId, function() {

										// get icon to show
										_this.getIcon(options.extensionId, 'images/notification-icon.png', function(icon) {

											icon = options.overrideIcon && options.notificationOptions.iconUrl || icon;

											// generate notification options
											var notificationOptions = i.common.Util.extendObject({
												type:		'basic',
												iconUrl:	icon,
												priority:	2,
												buttons:	[
													_this.buttons.IGNORE_ONE_MONTH,
													_this.buttons.IGNORE_FOREVER
												],
												isClickable: true
											}, options.notificationOptions);

											chrome.notifications.create(options.notificationId, notificationOptions, function(notificationId) {

												// when user clicks the notification body
												// open extension store page
												var readCallback = function() {
													i.common.Analytics.event('Notification', 'Click');
													// open webstore reviews link
													i.common.Util.openLink('https://chrome.google.com/webstore/detail/' + options.extensionId + '/' + options.clickType, true);
												};

												// when user clicks first button
												// ignore notifications for 1 month
												var ignoreCallbackMonth = function(notificationId) {
													i.common.Analytics.event('Notification', 'Exclude 1 Month');
													i.common.Extension.addExclusion(options.exclusionKey, options.extensionId, options.extensionName, false);
													chrome.notifications.clear(notificationId, function(){})
												};

												// when user clicks second button
												// ignore notifications forever
												var ignoreCallbackForever = function(notificationId) {
													i.common.Analytics.event('Notification', 'Exclude Forever');
													i.common.Extension.addExclusion(options.exclusionKey, options.extensionId, options.extensionName, true);
													chrome.notifications.clear(notificationId, function(){})
												};

												// save notification callbacks
												_this.notifications[notificationId] = {
													click: readCallback,
													button: [
														ignoreCallbackMonth,
														ignoreCallbackForever
													]
												};

											});

										});

									});

								}

							});

						}
						else {

							console.info(options.name, ' notifications disabled');

						}

					});

				}
				else {

					console.warn('Extension notifications disabled');

				}

			});

		},

		/**
		 * Clears a notification
		 * @param {String} notificationId	Notification ID
		 * @param {Function} callback		Callback after notification is cleared
		 */
		clearNotification: function(notificationId, callback) {

			chrome.notifications.clear(notificationId, function() {

				if (typeof callback === 'function') {
					callback();
				}

			});

		},

		/**
		 * Returns the icon url for the notification
		 * @param {String} extensionId	The extension id
		 * @param {String} defaultIcon	Default icon to show if the extension does not have one
		 * @param {Function} callback	Callback after icon is fetched
		 */
		getIcon: function(extensionId, defaultIcon, callback) {

			// get notification icon setting
			i.common.Settings.getSync('notificationIcon', function(icon) {

				console.log('getIcon:', icon);

				// show extension icon
				if (icon === 'extension') {

					callback(i.common.Extension.getIcon(extensionId, 128));

				}
				// show invigilator icons
				else {

					callback(defaultIcon);

				}

			});

		},

		/**
		 * Create an "Update" notification
		 * @param {Object} extension	Extension details
		 */
		update: function(extension) {

			// generate notification id
			var notificationId = 'invigilator-update-' + extension.id + '-' + extension.version;

			// create and show the notification
			this.showNotification({
				name:			'Update',
				extensionId:	extension.id,
				extensionName:	extension.name,
				showKey:		'showUpdateNotifications',
				exclusionKey:	'updateNotificationExclusions',
				clickType:		'details',
				notificationId:	notificationId,
				notificationOptions:	{
					title:			extension.name + ' Updated',
					message:		extension.name + ' has just been updated to version ' + extension.version,
					contextMessage:	'View details'
				}
			});

		},

		/**
		 * Create an "Owner Change" notification
		 * @param {Object} extension	Extension details
		 */
		owner: function(extension) {

			// generate notification id
			var notificationId = 'invigiator-owner-' + extension.id;

			// generate notification message
			var message = 'The owner name for "' + extension.name + '" has changed.';
			message += ' This may be legitimate and harmless, but a new owner could mean changes to the extension without your knowledge.';

			// create and show the notification
			this.showNotification({
				name:			'Owner Change',
				extensionId:	extension.id,
				extensionName:	extension.name,
				showKey:		'showOwnerChangeNotifications',
				exclusionKey:	'ownerChangeNotificationExclusions',
				clickType:		'reviews',
				notificationId:	notificationId,
				notificationOptions: {
					title:			'Owner Change Alert',
					message:		message,
					contextMessage:	'Click to find out more'
				}
			});

		},

		/**
		 * Create a "Bad Reviews" notification
		 * @param {Object} extension	Extension details
		 * @param {Number} count		Number of bad reviews
		 */
		reviews: function(extension, count) {

			// generate notification id
			var notificationId = 'invigilator-reviews-' + extension.id;

			// generate message
			var reviewPlural = count > 1 ? 'reviews' : 'review';
			var havePlural = count > 1 ? 'have' : 'has';
			var message = count + ' recent ' + reviewPlural + ' for "' + extension.name + '" ' + havePlural + ' been detected as potentially referring to adverts and/or spyware.';

			// create and show the notification
			this.showNotification({
				name:			'reviews',
				extensionId:	extension.id,
				extensionName:	extension.name,
				showKey:		'showReviewWarningNotifications',
				exclusionKey:	'reviewWarningNotificationExclusions',
				notificationId:	notificationId,
				clickType:		'reviews',
				overrideIcon:	true,
				notificationOptions: {
					title: 		'Review Alert',
					message:	message,
					iconUrl:	'images/notification-warning.png'
				}
			});

		}

	};

	/**
	 * Notification click event handler
	 */
	chrome.notifications.onClicked.addListener(function(notificationId) {

		// check notification events exist
		if (i.Notify.notifications.hasOwnProperty(notificationId)) {

			// get click callback
			var clickCallback = i.Notify.notifications[notificationId].click;

			// if it exists call it
			if (typeof clickCallback === 'function') {

				clickCallback(notificationId);

			}

		}

	});

	/**
	 * Notification button click event handler
	 */
	chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {

		// check notification events exist
		if (i.Notify.notifications.hasOwnProperty(notificationId)) {

			// get button callback
			var notification = i.Notify.notifications[notificationId].button;
			var buttonCallback = notification[buttonIndex];

			// if it exists call it
			if (typeof buttonCallback === 'function') {

				buttonCallback(notificationId, buttonIndex);

			}

		}

	});

	/**
	 * Notification closed event handler
	 */
	chrome.notifications.onClosed.addListener(function(notificationId, byUser) {

		// clean up notification callback
		var notifications = i.Notify.notifications;
		delete notifications[notificationId];

		// log event if the user manually closed the notification
		if (byUser) {
			i.common.Analytics.event('Notification', 'Closed');
		}

	});

})(Invigilator);