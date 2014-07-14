/**
 * Exclusion table class for notification exclusions
 */
(function(i) {

	/**
	 * Class constructor
	 * @param {String} name			Setting key of the exclusion
	 * @param {String} description	Descript of the exclusion
	 * @constructor
	 */
	i.form.ExclusionTable = function(name, description) {

		// set properties
		this.name = name;
		this.description = description;

	};

	i.form.ExclusionTable.prototype = {

		/**
		 * Shows or hides the table
		 * @param {Boolean} show	True to show the table, false to hide it
		 */
		toggle: function(show) {

			// show
			if (show) {
				this.show();
			}
			// hide
			else {
				this.hide();
			}

		},

		/**
		 * Show the table
		 */
		show: function() {

			$('#' + this.name).show();

		},

		/**
		 * Hide the table
		 */
		hide: function() {

			$('#' + this.name).hide();

		},

		/**
		 * Generate the table html and register events
		 */
		generate: function() {

			var _this = this;

			// get exclusions
			i.common.Settings.getSync(_this.name, function(exclusions) {

				// get elements
				var $container = $('#' + _this.name);
				var $helpBlock = $('.help-block', $container);
				var $table = $('.table', $container);

				// no exclusions added yet
				if (i.common.Util.isEmptyObject(exclusions)) {

					// set help text and hide table
					$helpBlock.text('No extensions are currently excluded from ' + _this.description + '.');
					$table.hide();

				}
				// some exclusions added
				else {

					// set help text
					$helpBlock.text('The following extensions are excluded from ' + _this.description + ':');

					// loop through each exclusion
					for (var extensionId in exclusions) {

						// get current exclusion
						var exclusion = exclusions[extensionId];

						// get exclusion name
						var name = exclusion.name;

						// get exclusion date
						var date = exclusion.date;
						if (false === date) {
							date = 'Forever';
						}
						else {
							date = 'until ' + moment(date).format('LL');
						}

						 // generate row html
						var row = [
							'<tr>',
							'<td class="icon"><img src="' + i.common.Extension.getIcon(extensionId, 24) + '"></td>',
								'<td>' + name + ' (' + extensionId + ')</td>',
								'<td>' + date + '</td>',
								'<td><a class="remove" data-id="' + extensionId + '" href="#"><span class="glyphicon glyphicon-trash"></span></a></td>',
							'</tr>'
						].join('');

						// add it to the table
						$table.append(row);

					}

					// enable tooltips
					$('.glyphicon', $table).tooltip({
						title: 'Remove exclusion',
						placement: 'top'
					});

					// add remove event for each row
					$('.remove').on('click', function(e) {
						e.preventDefault();
						var $row = $(this).closest('tr');

						// remove exclusion
						i.common.Extension.removeExclusion(_this.name, $(this).data('id'), function() {

							// fade out the row and then re-generate the table
							$row.fadeOut(400, function() {
								_this.generate();
							});

						});

					});

					// show the table
					$('.table', $container).show();

				}

			});

		}

	};

})(Invigilator);