'use strict';

(function(window, $, Routing, swal) {
    window.RepLogApp = function($wrapper) {
                this.$wrapper = $wrapper;
                this.helper = new Helper($wrapper);
                this.loadRepLogs();
                this.$wrapper.on('click',
                    '.js-delete-rep-log',
                    this.handleRepLogDelete.bind(this)
                );
                this.$wrapper.on('click',
                    'tbody tr',
                    this.handleRowClick.bind(this)
                );
                this.$wrapper.on('submit',
                    '.js-rep-log-form',
                    this.handleNewFormSubmit.bind(this)
                );
            }
    $.extend(RepLogApp.prototype, {

        _selectors: {
            newRepForm: '.js-rep-log-form',
        },

        loadRepLogs: function() {
            var self = this;
            $.ajax({
                url: Routing.generate('rep_log_list')
            }).then(function(data) {
                    $.each(data.items, function(key, repLog) {
                        self._addRow(repLog);
                    });
            });
        },

        updateTotalWeightLifted: function() {
            var totalWeight = this.helper.calculateTotalWeight(this.$wrapper)
            this.$wrapper.find('.js-total-weight').html(totalWeight);
        },

        handleRepLogDelete: function(e) {
            e.preventDefault();
            var $link = $(e.currentTarget);
            var self = this;
            swal({
              title: 'Delete this log?',
              text: "What? Did you not actualy lift this?",
              type: 'warning',
              showCancelButton: true,
              showCloseButton: true,
              showLoaderOnConfirm: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, delete it!',
              preConfirm: function() {
                return self._deleteRepLog($link);
              }
            }).then((result) => {
               if(result.dismiss === swal.DismissReason.cancel) {
                console.log('Canceled!!!');
              }
            });

        },

        _deleteRepLog: function($link) {
            $link.find(".fa")
            .removeClass("fa-trash")
            .addClass("fa-spinner")
            .addClass("fa-spin");
            var deleteUrl = $link.data('url');
            var $row = $link.closest('tr');
            var self = this;
            $.ajax({
                url: deleteUrl,
                method: "DELETE"
            }).then(function() { 
                $row.fadeOut('normal', function() {
                    $row.remove();
                    self.updateTotalWeightLifted();
                    });
                });
        },

        handleRowClick: function() {
            console.log('row clicked');
        },

        handleNewFormSubmit: function(e) {
            e.preventDefault();
            var $form = $(this._selectors.newRepForm);
            var formData = {};
            var self = this;
            $.each($form.serializeArray(), function(key, fieldData) {
                formData[fieldData.name] = fieldData.value;
            });
            this._saveRepLog(formData).then(function(data) {
                self._clearForm();
                self._addRow(data);
            }).catch(function(jqXHR) {
                var errorData = $.parseJSON(jqXHR.responseText);
                self._mapErrorsToForm(errorData.errors);
            });
        },

        _mapErrorsToForm: function(errors) {
            var $form = $(this._selectors.newRepForm);

            this._removeFormErrors();

            $form.find(':input').each(function() {
                var fieldName = $(this).attr('name');
                var $wrapper = $(this).closest('.form-group');
                if(!errors[fieldName]) {
                    // no errors
                    return;
                }

                var $error = $('<span class="js-field-error help-block"></span>');
                $error.html(errors[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');

            });
        },

        _removeFormErrors: function() {
            var $form = $(this._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        },

        _clearForm: function() {
            var $form = $(this._selectors.newRepForm);
            this._removeFormErrors();
            $form[0].reset();
        },

        _addRow: function(repLog) {
            var tmpText = $('#js-rep-log-row-template').html();
            var tmp = _.template(tmpText);
            var html = tmp(repLog);
            this.$wrapper.find('tbody').append($.parseHTML(html));
            this.updateTotalWeightLifted();
        },

        _saveRepLog: function(data) {
            return $.ajax({
                url: Routing.generate('rep_log_new'),
                method: 'POST',
                data: JSON.stringify(data)
            }).then(function(data, textStatus, jqXHR) {
                return $.ajax({
                    url: jqXHR.getResponseHeader('Location')
                });
            });
        }

    });

    var Helper = function($wrapper) {
            this.$wrapper = $wrapper;
        };
        $.extend(Helper.prototype, {
            calculateTotalWeight: function($wrapper) {
                var totalWeight = 0;
                $wrapper.find('tbody tr').each(function() {
                    totalWeight += $(this).data('weight');
                });
                return totalWeight;
            }
        });

})(window, jQuery, Routing, swal);