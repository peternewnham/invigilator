/**
 * Installed tab functionality
 */
(function(i) {

	i.Installed = {

		/**
		 * Generate the tab content
		 */
		generate: function() {

			var _this = this;

			// get all "live" extensions extensions
			i.common.Extension.getAll(function(liveExtensions) {

				// get all "stored" extensions
				i.common.IndexedDB.getAllFromStore('extensions', { direction: 'next' }, function(storeExtensions) {

					// create extension groups
					var types = {
						dev: {
							title:	'In Development',
							icon:	'images/development.png',
							items:	[]
						},
						extension: {
							title:	'Extensions',
							icon:	'images/extension.png',
							items:	[]
						},
						app: {
							title:	'Apps',
							icon:	'images/app.png',
							items:	[]
						},
						theme: {
							title:	'Themes',
							icon:	'',
							items:	[]
						}
					};

					console.group('Installed.generate');

					// loop through each live extensions
					for (var j=0; j<liveExtensions.length; j++) {

						// get current live extension
						var extension = liveExtensions[j];

						console.log(extension.name, extension);

						// in dev mode
						if (i.common.Extension.isDev(extension)) {

							// add it to the dev group
							types.dev.items.push(extension);

						}
						// not in dev mode
						else {

							// get the stored extension for the live extension
							for (var k=0; k<storeExtensions.length; k++) {
								var storeExtension = storeExtensions[k];
								if (storeExtension.id === extension.id) {
									extension = storeExtension;
									break;
								}
							}

							// add it to a group
							switch (extension.type) {

								// extensions
								case 'extension':
									types.extension.items.push(extension);
									break;

								// apps
								case 'hosted_app':
								case 'packaged_app':
								case 'legacy_packaged_app':
									types.app.items.push(extension);
									break;

								// themes
								case 'theme':
									types.theme.items.push(extension);
									break;

							}

						}

					}

					console.groupEnd();

					// loop through each type group
					for (var type in types) {

						// if type group has items
						if (types[type].items.length > 0) {

							// add the group to the tab content
							_this.addType(types[type]);

						}

					}

				});

			});

		},

		/**
		 * Add a type group to the tab content
		 * @param {Object} type	The type group details and items
		 */
		addType: function(type) {

			// generate html

			var typeHtml = '<div class="type">';

				// group icon and header

				typeHtml += '<h3';
				if (type.icon) {
					typeHtml += ' style="background:url(' + type.icon + ') left top no-repeat;"';
				}
				typeHtml += '>' + type.title + '</h3>';

				typeHtml += '<div class="items">';

				// loop through each item in the group
				for (var j=0; j<type.items.length; j++) {

					// generate item html and add it to the group
					typeHtml += this.addItem(type.items[j]);

				}

				typeHtml += '</div>';

			typeHtml += '</div>';

			// add group html to the tab content
			$('#installed').append(typeHtml);

		},

		/**
		 * Generates the container and item html for an extension
		 * @param {Object} item		Extension details
		 * @returns {string}
		 */
		addItem: function(item) {

			// open item container
			var itemHtml = '<div id="installed-' + item.id + '" class="item clearfix';
			if (!item.enabled) {
				itemHtml += ' item-disabled';
			}
			itemHtml += '">';

			itemHtml += this.generateItemHtml(item);

			// close item container
			itemHtml += '</div>';

			return itemHtml;

		},

		/**
		 * Updates an extension
		 * @param {Object} item		Extension details
		 */
		updateItem: function(item) {

			// get container
			var itemDiv = $('#installed-' + item.id)

			// toggle disabled class
			if (item.enabled) {
				itemDiv.removeClass('item-disabled');
			}
			else {
				itemDiv.addClass('item-disabled');
			}

			// regenerate and replace html
			itemDiv.html(this.generateItemHtml(item));

		},

		/**
		 * Generates the item html for an extension
		 * @param {Object} item		Extension details
		 * @returns {string}
		 */
		generateItemHtml: function(item) {

			// set dev mode flag
			var devMode = i.common.Extension.isDev(item);

			var itemHtml = '';

			// icon
			itemHtml += '<div class="icon">';
			itemHtml += '<img src="' + i.common.Extension.getIcon(item.id, 48, !item.enabled) + '">';

			// add options url if there is one and extension is enabled
			if (item.enabled && !!item.optionsUrl) {
				itemHtml += '<div class="options"><a href="' + item.optionsUrl + '">' +
								'<span class="glyphicon glyphicon-cog"></span> Options</a></div>';
			}

			itemHtml += '</div>';

			// details
			itemHtml += '<div class="details">';

			// name + version
			itemHtml += '<h4>' + item.name + ' <span class="version">' + item.version + '</span></h4>';

			// disable warning
			if (!item.mayDisable) {
				itemHtml += '<span class="label label-warning"><span class="glyphicon glyphicon-exclamation-sign"></span> User management has been disabled for this item.</span>';
			}

			// description
			itemHtml += '<p class="description">' + item.description + '</p>';

			// extension not in dev mode
			if (!devMode) {

				// open owner and sites
				itemHtml += '<div class="additional">';

				// owner
				itemHtml += '<label><span class="glyphicon glyphicon-user"></span> Owner:</label>';
				itemHtml += '<span>';
				if (item.owner) {
					itemHtml += item.owner;
				}
				else {
					itemHtml += '<em>Unknown</em>';
				}
				itemHtml += '</span>';

				// set webstore and homepage url as the same
				var homepageUrl = item.homepageUrl;
				var webstoreUrl = homepageUrl;

				// if webstore url is from the chrome store then there is no alternative homepage so remove it
				if (/^https:\/\/chrome\.google\.com\/webstore/.test(webstoreUrl)) {
					homepageUrl = '';
				}
				// otherwise there is a different webstore and homepage url so set both
				else {
					webstoreUrl = 'https://chrome.google.com/webstore/detail/' + item.id;
				}

				// webstore url
				if (webstoreUrl !== '') {
					itemHtml += '<span><a href="' + webstoreUrl + '">Visit Webstore Page</a></span>';
				}

				// homepage url
				if (homepageUrl !== '') {
					itemHtml += '<span><a href="' + homepageUrl + '">Visit Homepage</a></span>';
				}

				// extension tab link
				itemHtml += '<span><a href="chrome://extensions/?id=' + item.id + '">Open in Extensions Tab</a></span>';

				// close additional details
				itemHtml += '</div>';

				// open dates
				itemHtml += '<div class="additional">';

				// date installed
				itemHtml += '<label><span class="glyphicon glyphicon-calendar"></span> Date Installed:</label>';
				itemHtml += '<span>';
				if (item.dateInstalled) {
					itemHtml += moment(item.dateInstalled).format('D MMM YYYY HH:mm');
				}
				else {
					itemHtml += '<em>Unknown</em>';
				}
				itemHtml += '</span>';

				// date updated
				itemHtml += '<label><span class="glyphicon glyphicon-calendar"></span> Last Updated:</label>';
				itemHtml += '<span>';
				if (item.dateUpdated) {
					itemHtml += moment(item.dateUpdated).format('D MMM YYYY HH:mm');
				}
				else {
					itemHtml += '<em>Never</em>';
				}
				itemHtml += '</span>';

				// close dates
				itemHtml += '</div>';

			}
			else if (item.enabled) {

				itemHtml += '<a href="#" class="btn btn-success btn-sm action-reload"><span class="glyphicon glyphicon-refresh"></span> Reload Extension</a>';

			}

			// close details
			itemHtml += '</div>';

			// open actions
			itemHtml += '<div class="actions">';

			// launch app
			if (item.appLaunchUrl && item.enabled) {
				itemHtml += '<div>';
				itemHtml += '<a href="' + item.appLaunchUrl + '" class="btn btn-info app-launch">Launch <span class="glyphicon glyphicon-play-circle"></span></a>';
				itemHtml += '</div>';
			}

			// enable

			var enableDisabled = item.mayDisable ? '' : 'disabled';

			itemHtml += '<div>';
			itemHtml += '<label class="' + enableDisabled + '">';
			if (item.enabled) {
				itemHtml += '<input class="action-enable" type="checkbox" checked ' + enableDisabled + '> Enabled';
			}
			else {
				itemHtml += '<input class="action-enable" type="checkbox" ' + enableDisabled + '> Enable';
			}
			itemHtml += '</label>';
			itemHtml += '</div>';

			// uninstall

			var uninstallDisabled = item.mayDisable ? '' : 'disabled';

			itemHtml += '<div class="uninstall ' + uninstallDisabled + '">';

				itemHtml += '<div class="proceed">';
				itemHtml += '<a href="#" class="btn btn-danger btn-sm action-uninstall ' + uninstallDisabled + '"><span class="glyphicon glyphicon-trash"></span> Uninstall</a>';
				itemHtml += '</div>';

				itemHtml += '<div class="confirm hidden">';
					itemHtml += '<a href="#" class="btn btn-warning btn-xs action-cancel-uninstall"><span class="glyphicon glyphicon-remove"></span> Cancel</a>';
					itemHtml += '<a href="#" class="btn btn-danger btn-sm action-confirm-uninstall"><span class="glyphicon glyphicon-ok"></span> Confirm Uninstall</a>';
				itemHtml += '</div>';

			itemHtml += '</div>';

			// close actions
			itemHtml += '</div>';

			return itemHtml;

		},

		/**
		 * Remove an item from the tab content
		 * @param {String} itemId	Extension id
		 */
		removeItem: function(itemId) {

			// fade it out and then remove
			$('#installed-' + itemId).fadeOut(500, function() {
				$('#installed-' + itemId).remove();
			});

		},

		/**
		 * Returns the extension id from an element within an item div
		 * @param {HTMLElement} el	The element to extract the id from
		 * @returns {string}
		 */
		getItemId: function(el) {

			// find closest div with "item" class and get id
			return $(el).closest('.item').attr('id').replace(/^installed\-/, '');

		},

		/**
		 * Initialise event listeners
		 */
		initEvents: function() {

			var _this = this;

			/*
			 * Enable/disable extension
			 */
			$('body').on('change', '.action-enable', function(e) {
				if (this.checked) {
					// track event
					i.common.Analytics.event('Extension', 'Enable');
					i.common.Extension.enable(_this.getItemId(this));
				}
				else {
					// track event
					i.common.Analytics.event('Extension', 'Disable');
					i.common.Extension.disable(_this.getItemId(this));
				}
			});

			/*
			 * "Reload" developer extensions
			 */
			$('body').on('click', '.action-reload', function(e) {

				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Reload');

				Invigilator.common.Extension.reload(_this.getItemId(this));

			});

			/*
			 * Initialise uninstall extension
			 */

			// show confirm
			$('body').on('click', '.action-uninstall', function(e) {

				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Uninstall');

				var ct = $(this).closest('.uninstall');
				ct.find('.proceed').addClass('hidden');
				ct.find('.confirm').removeClass('hidden');

			});

			/*
			 * Cancel uninstall
			 */
			$('body').on('click', '.action-cancel-uninstall', function(e) {
				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Cancel Uninstall');

				var ct = $(this).closest('.uninstall');
				ct.find('.proceed').removeClass('hidden');
				ct.find('.confirm').addClass('hidden');
			});

			/*
			 * Confirm uninstall
			 */
			$('body').on('click', '.action-confirm-uninstall', function(e) {
				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Confirm Uninstall');

				Invigilator.common.Extension.uninstall(_this.getItemId(this));
			});

			/*
			 * App launch
			 */
			$('body').on('click', '.app-launch', function() {
				// track event
				i.common.Analytics.event('Extension', 'App Launch');
			});

		}

	};

	// initialise
	$(function() {

		i.Installed.generate();
		i.Installed.initEvents();

	});

})(Invigilator);