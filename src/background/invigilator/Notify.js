(function(i) {

	i.Notify = {

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

		notifications: {},

		getDate: function() {

			return moment(new Date).format('LLLL');

		},

		showNotification: function(options, callback) {

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

											// TODO: remove exclusion

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

												var readCallback = function() {
													i.common.Analytics.event('Notification', 'Click');
													// open webstore reviews link
													i.common.Util.openLink('https://chrome.google.com/webstore/detail/' + options.extensionId + '/' + options.clickType);
												};

												var ignoreCallbackMonth = function(notificationId) {
													i.common.Analytics.event('Notification', 'Exclude 1 Month');
													i.common.Extension.addExclusion(options.exclusionKey, options.extensionId, options.extensionName, false);
													chrome.notifications.clear(notificationId, function(){})
												};

												var ignoreCallbackForever = function(notificationId) {
													i.common.Analytics.event('Notification', 'Exclude Forever');
													i.common.Extension.addExclusion(options.exclusionKey, options.extensionId, options.extensionName, true);
													chrome.notifications.clear(notificationId, function(){})
												};

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

		clearNotification: function(notificationId, callback) {

			chrome.notifications.clear(notificationId, function() {

				if (typeof callback === 'function') {
					callback();
				}

			});

		},

		getIcon: function(extensionId, defaultIcon, callback) {

			i.common.Settings.getSync('notificationIcon', function(icon) {

				console.log('getIcon:', icon);

				if (icon === 'extension') {

					callback(i.common.Extension.getIcon(extensionId, 128));

				}
				else {

					callback(defaultIcon);

				}

			});

		},

		update: function(extension) {

			var notificationId = 'invigilator-update-' + extension.id + '-' + extension.version;

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

		owner: function(extension) {

			var notificationId = 'invigiator-owner-' + extension.id;

			var message = 'The owner name for "' + extension.name + '" has changed.';
			message += ' This may be legitimate and harmless, but a new owner could mean changes to the extension without your knowledge.';

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

		reviews: function(extension, count) {

			var _this = this;

			var notificationId = 'invigilator-reviews-' + extension.id;

			var reviewPlural = count > 1 ? 'reviews' : 'review';
			var havePlural = count > 1 ? 'have' : 'has';

			var message = count + ' recent ' + reviewPlural + ' for "' + extension.name + '" ' + havePlural + ' been detected as potentially referring to adverts and/or spyware.';

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

	chrome.notifications.onClicked.addListener(function(notificationId) {

		if (i.Notify.notifications.hasOwnProperty(notificationId)) {

			var clickCallback = i.Notify.notifications[notificationId].click;

			if (typeof clickCallback === 'function') {

				clickCallback(notificationId);

			}

		}

	});

	chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {

		if (i.Notify.notifications.hasOwnProperty(notificationId)) {

			var notification = i.Notify.notifications[notificationId].button;

			var buttonCallback = notification[buttonIndex];

			if (typeof buttonCallback === 'function') {

				buttonCallback(notificationId, buttonIndex);

			}

		}

	});

	chrome.notifications.onClosed.addListener(function(notificationId, byUser) {

		// clean up notification callback
		var notifications = i.Notify.notifications;
		delete notifications[notificationId];

		if (byUser) {
			i.common.Analytics.event('Notification', 'Closed');
		}

	});

})(Invigilator);