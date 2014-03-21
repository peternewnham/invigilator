(function(i) {

	i.Notify = {

		emptyFn: function(){},

		update: function(extension) {

			chrome.notifications.create('', {
				type:		'basic',
				iconUrl:	'images/notification-icon.png',
				title:		extension.name + ' Updated',
				message:	extension.name + ' has just been updated to version ' + extension.version,
				priority:	2
			}, this.emptyFn);

		},

		owner: function(extension) {

			var message = 'The owner for ' + extension.name + ' has changed. ';
			message += 'This could be a bad thing!'

			chrome.notifications.create('', {
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
			}, this.emptyFn);

		},

		reviews: function(extension) {

			chrome.notifications.create('', {
				type:		'basic',
				iconUrl:	'images/notification-warning.png',
				title:		'Owner Change Alert',
				message:	'The owner for ' + extension.name + ' has changed.',
				priority:	2,
				buttons:	[
					{
						title:	'Find out more'
					}
				]
			}, this.emptyFn);

		}

	};

})(Invigilator);