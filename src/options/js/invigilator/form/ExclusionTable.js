(function(i) {

	i.form.ExclusionTable = function(name, description) {

		this.name = name;
		this.description = description;

	};

	i.form.ExclusionTable.prototype = {

		toggle: function(show) {

			if (show) {
				this.show();
			}
			else {
				this.hide();
			}

		},

		show: function() {

			$('#' + this.name).show();

		},

		hide: function() {

			$('#' + this.name).hide();

		},

		generate: function() {

			var _this = this;

			i.common.Settings.getSync(_this.name, function(exclusions) {

				var $container = $('#' + _this.name);
				var $helpBlock = $('.help-block', $container);
				var $table = $('.table', $container);

				if (i.common.Util.isEmptyObject(exclusions)) {

					$helpBlock.text('No extensions are currently excluded from ' + _this.description + '.');
					$table.hide();

				}
				else {

					$helpBlock.text('The following extensions are excluded from ' + _this.description + ':');

					for (var extensionId in exclusions) {

						var exclusion = exclusions[extensionId];

						var name = exclusion.name;
						var date = exclusion.date;
						if (false === date) {
							date = 'Forever';
						}
						else {
							date = 'until ' + moment(date).format('LL');
						}

						var row = [
							'<tr>',
							'<td class="icon"><img src="' + i.common.Extension.getIcon(extensionId, 24) + '"></td>',
								'<td>' + name + ' (' + extensionId + ')</td>',
								'<td>' + date + '</td>',
								'<td><a class="remove" data-id="' + extensionId + '" href="#"><span class="glyphicon glyphicon-trash"></span></a></td>',
							'</tr>'
						].join('');

						$table.append(row);

					}

					// enable tooltips
					$('.glyphicon', $table).tooltip({
						title: 'Remove exclusion',
						placement: 'top'
					});

					$('.remove').on('click', function(e) {
						e.preventDefault();
						var $row = $(this).closest('tr');
						i.common.Extension.removeExclusion(_this.name, $(this).data('id'), function() {
							$row.fadeOut(400, function() {
								_this.generate();
							});
						});
					});

					$('.table', $container).show();

				}

			});

		}

	};

})(Invigilator);