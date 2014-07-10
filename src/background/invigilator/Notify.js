(function(i) {

	i.Notify = {

		notifications: {},

		getDate: function() {

			return moment(new Date).format('LLL');

		},

		showNotification: function(id, options, callback) {

			chrome.notifications.getPermissionLevel(function(level) {

				if (level === 'granted') {

					chrome.notifications.create(id, options, callback || function(){});

				}
				else {

					console.warn('Extension notifications disabled');

				}

			});

		},

		getIcon: function(extensionId, defaultIcon, callback) {

			i.common.Settings.getSync('notificationIcon', function(icon) {

				console.log(icon);

				if (icon === 'extension') {

					callback(i.common.Extension.getIcon(extensionId, 128));

				}
				else {

					callback(defaultIcon);

				}

			});

		},

		update: function(extension) {

			var _this = this;

			this.getIcon(extension.id, 'images/notification-icon.png', function(icon) {

				_this.showNotification('invigilator-update-' + extension.id, {
					type:		'basic',
					iconUrl:	icon,
					title:		extension.name + ' Updated',
					message:	extension.name + ' has just been updated to version ' + extension.version,
					contextMessage: (new Date).toISOString(),
					priority:	2,
					buttons:	[
						{
							title: 'Visit webstore page',
							iconUrl: 'images/notification-btn-ignore.png'
						}
					]
				});

			});

		},

		owner: function(extension) {

			var message = 'The owner name for "' + extension.name + '" has changed.';
			message += 'This could be a bad thing!'

			this.showNotification('invigilator-owner-' + extension.id, {
				type:		'basic',
				iconUrl:	'images/notification-warning.png',
				title:		'Owner Change Alert',
				message:	message,
				priority:	2,
				buttons:	[
					{
						title:	'Find out more'
					}
				]
			});

		},

		reviews: function(extension, count) {

			var _this = this;

			i.common.Settings.getSync('showReviewWarningNotifications', function(show) {

				if (show) {

					console.info('Review Warning Notifications Enabled');

					i.common.Settings.getSync('reviewWarningNotificationExclusions', function(exclusions) {

						var ignore = false;

						if (exclusions.hasOwnProperty(extension.id)) {

							var exclusion = exclusions[extension.id];

							var name = exclusion.name;
							var date = exclusion.date;

							if (false === date) {

								console.warn('Ignoring review warning notification for \'' + name + '\': forever');

								ignore = true;

							}
							else {

								var now = new Date();

								if (date > now) {

									console.warn('Ignoring review warning notification for \'' + name + '\': until ', (new Date(date)));

									ignore = true;

								}

							}

						}

						if (!ignore) {

							console.info('Showing review warning notification for \'' + name + '\'');

							var reviewPlural = count > 1 ? 'reviews' : 'review';
							var havePlural = count > 1 ? 'have' : 'has';

							var message = count + ' recent ' + reviewPlural + ' for "' + extension.name + '" ' + havePlural + ' been detected as potentially referring to adverts and/or spyware.';

							_this.showNotification('invigilator-reviews-' + extension.id, {
								type:		'basic',
								iconUrl:	'images/notification-warning.png',
								title:		'Review Alert',
								message:	message,
								contextMessage: _this.getDate(),
								priority:	2,
								isClickable: true,
								buttons:	[
									{
										title:	'Ignore for this extension for 1 month',
										iconUrl: 'images/notification-btn-ignore.png'
									},
									{
										title:	'Ignore for this extension forever',
										iconUrl: 'images/notification-btn-ignore.png'
									}
								]
							}, function(notificationId) {

								var readCallback = function() {

									// open webstore reviews link
									i.common.Util.openLink('https://chrome.google.com/webstore/detail/' + extension.id + '/reviews');

								};

								var ignoreCallbackMonth = function(notificationId) {

									i.common.Extension.addExclusion('reviewWarningNotificationExclusions', extension, false);

									chrome.notifications.clear(notificationId, function(){})

								};

								var ignoreCallbackForever = function(notificationId) {

									i.common.Extension.addExclusion('reviewWarningNotificationExclusions', extension, true);

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

						}
						else {

							console.info('Ignoring review notification for ' + extension.name);

						}

					});

				}
				else {

					console.warn('Review Warning Notifications Disabled');

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

		var notifications = i.Notify.notifications;

		delete notifications[notificationId];

	});

})(Invigilator);