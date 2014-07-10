(function(i) {

	i.Installed = {

		generate: function() {

			var _this = this;

			i.common.Extension.getAll(function(liveExtensions) {

				i.common.IndexedDB.getAllFromStore('extensions', { direction: 'next' }, function(storeExtensions) {

					var types = {
						dev: {
							title:	'In Development',
							icon:	'images/development.png',
							items:	[]
						},
						extension: {
							title:	'Your Extensions',
							icon:	'images/extension.png',
							items:	[]
						},
						app: {
							title:	'Your Apps',
							icon:	'images/app.png',
							items:	[]
						},
						theme: {
							title:	'Your Themes',
							icon:	'',
							items:	[]
						}
					};

					console.group('Installed.generate');

					for (var j=0; j<liveExtensions.length; j++) {

						var extension = liveExtensions[j];

						console.log(extension.name, extension);

						if (i.common.Extension.isDev(extension)) {

							types.dev.items.push(extension);

						}
						else {

							// get stored extension
							for (var k=0; k<storeExtensions.length; k++) {
								var storeExtension = storeExtensions[k];
								if (storeExtension.id === extension.id) {
									extension = storeExtension;
									break;
								}
							}

							switch (extension.type) {

								case 'extension':
									types.extension.items.push(extension);
									break;
								case 'hosted_app':
								case 'packaged_app':
								case 'legacy_packaged_app':
									types.app.items.push(extension);
									break;
								case 'theme':
									types.theme.items.push(extension);
									break;

							}

						}

					}

					console.groupEnd();

					for (var type in types) {

						if (types[type].items.length > 0) {

							_this.addType(types[type]);

						}

					}

				});

			});

		},

		addType: function(type) {

			var typeHtml = '<div class="type">';

				typeHtml += '<h3';
				if (type.icon) {
					typeHtml += ' style="background:url(' + type.icon + ') left top no-repeat;"';
				}
				typeHtml += '>' + type.title + '</h3>';

				typeHtml += '<div class="items">';

				for (var j=0; j<type.items.length; j++) {

					typeHtml += this.addItem(type.items[j]);

				}

				typeHtml += '</div>';

			typeHtml += '</div>';

			$('#installed').append(typeHtml);

		},

		addItem: function(item) {

			// open item
			var itemHtml = '<div id="installed-' + item.id + '" class="item clearfix';
			if (!item.enabled) {
				itemHtml += ' item-disabled';
			}
			itemHtml += '">';

			itemHtml += this.generateItemHtml(item);

			// close item
			itemHtml += '</div>';

			return itemHtml;

		},

		updateItem: function(item) {

			var itemDiv = $('#installed-' + item.id)

			if (item.enabled) {
				itemDiv.removeClass('item-disabled');
			}
			else {
				itemDiv.addClass('item-disabled');
			}

			itemDiv.html(this.generateItemHtml(item));

		},

		generateItemHtml: function(item) {

			var devMode = i.common.Extension.isDev(item);

			var itemHtml = '';

			// icon
			itemHtml += '<div class="icon">';
			itemHtml += '<img src="' + i.common.Extension.getIcon(item.id, 48, !item.enabled) + '">';
			itemHtml += '</div>';

			// details
			itemHtml += '<div class="details">';

			// name + version
			itemHtml += '<h4>' + item.name + ' <span class="version">' + item.version + '</span></h4>';

			// description
			itemHtml += '<p class="description">' + item.description + '</p>';

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

				// urls
				var homepageUrl = item.homepageUrl;
				var webstoreUrl = homepageUrl;
				//
				if (/^https:\/\/chrome\.google\.com\/webstore/.test(webstoreUrl)) {
					homepageUrl = '';
				}
				else {
					webstoreUrl = 'https://chrome.google.com/webstore/detail/' + item.id;
				}

				if (webstoreUrl !== '') {
					itemHtml += '<span><a href="' + webstoreUrl + '">Visit Webstore Page</a></span>';
				}

				if (homepageUrl !== '') {
					itemHtml += '<span><a href="' + homepageUrl + '">Visit Homepage</a></span>';
				}

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

			// open permissions
			/*itemHtml += '<div class="permissions">';

			 itemHtml += '<label>Permissions:</label> ';

			 if (item.permissions.length > 0) {
			 itemHtml += item.permissions.join(', ');
			 }
			 else {
			 itemHtml += 'None';
			 }

			 // close permissions
			 itemHtml += '</div>';*/

			// close details
			itemHtml += '</div>';

			// open actions
			itemHtml += '<div class="actions">';

			// launch app
			if (item.appLaunchUrl) {
				itemHtml += '<div>';
				itemHtml += '<a href="' + item.appLaunchUrl + '" class="btn btn-info app-launch">Launch <span class="glyphicon glyphicon-play-circle"></span></a>';
				itemHtml += '</div>';
			}

			// enable
			itemHtml += '<div>';
			itemHtml += '<label class="checkbox">';
			if (item.enabled) {
				itemHtml += '<input class="action-enable" type="checkbox" checked> Enabled';
			}
			else {
				itemHtml += '<input class="action-enable" type="checkbox"> Enable';
			}
			itemHtml += '</label>';
			itemHtml += '</div>';

			// uninstall
			itemHtml += '<div class="uninstall">';

				itemHtml += '<div class="proceed">';
				itemHtml += '<a href="#" class="btn btn-danger btn-sm action-uninstall"><span class="glyphicon glyphicon-trash"></span> Uninstall</a>';
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

		removeItem: function(itemId) {

			$('#installed-' + itemId).fadeOut(500, function() {
				$('#installed-' + itemId).remove();
			});

		},

		/**
		 * Returns the extension id from an element within an item div
		 * @param el
		 * @returns {string}
		 */
		getItemId: function(el) {

			return $(el).closest('.item').attr('id').replace(/^installed\-/, '');

		},

		initEvents: function() {

			var _this = this;

			// enable/disable extension
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

			// reload developer extensions
			$('body').on('click', '.action-reload', function(e) {

				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Reload');

				Invigilator.common.Extension.reload(_this.getItemId(this));

			});

			/**
			 * Uninstall
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

			// cancel uninstall
			$('body').on('click', '.action-cancel-uninstall', function(e) {
				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Cancel Uninstall');

				var ct = $(this).closest('.uninstall');
				ct.find('.proceed').removeClass('hidden');
				ct.find('.confirm').addClass('hidden');
			});

			// confirm uninstall
			$('body').on('click', '.action-confirm-uninstall', function(e) {
				e.preventDefault();

				// track event
				i.common.Analytics.event('Extension', 'Confirm Uninstall');

				Invigilator.common.Extension.uninstall(_this.getItemId(this));
			});

			// app launch
			$('body').on('click', '.app-launch', function() {
				// track event
				i.common.Analytics.event('Extension', 'App Launch');
			});

		}

	};

	$(function() {

		i.Installed.generate();
		i.Installed.initEvents();

	});

})(Invigilator);