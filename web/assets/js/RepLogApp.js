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

        loadRepLogs() {
            $.ajax({
                url: Routing.generate('rep_log_list')
            }).then(data => {
                    $.each(data.items, (key, repLog) => {
                        this._addRow(repLog);
                    });
            });
        },

        updateTotalWeightLifted() {
            const totalWeight = this.helper.totalWeightString();
            this.$wrapper.find('.js-total-weight').html(totalWeight);
        },

        handleRepLogDelete(e) {
            e.preventDefault();
            const $link = $(e.currentTarget);
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
              preConfirm: () => this._deleteRepLog($link)
            }).then(result => {
               if(result.dismiss === swal.DismissReason.cancel) {
                console.log('Canceled!!!');
              }
            });

        },

        _deleteRepLog($link) {
            $link.find(".fa")
            .removeClass("fa-trash")
            .addClass("fa-spinner")
            .addClass("fa-spin");
            const url = $link.data('url');
            const $row = $link.closest('tr');
            $.ajax({
                url,
                method: "DELETE"
            }).then(() => { 
                $row.fadeOut('normal', () => {
                    $row.remove();
                    this.updateTotalWeightLifted();
                    });
                });
        },

        handleRowClick() {
            console.log('row clicked');
        },

        handleNewFormSubmit(e) {
            e.preventDefault();
            const $form = $(this._selectors.newRepForm);
            const formData = {};
            $.each($form.serializeArray(), (key, fieldData) => {
                formData[fieldData.name] = fieldData.value;
            });
            this._saveRepLog(formData).then(data => {
                this._clearForm();
                this._addRow(data);
            }).catch(jqXHR => {
                const errorData = $.parseJSON(jqXHR.responseText);
                this._mapErrorsToForm(errorData.errors);
            });
        },

        _mapErrorsToForm(errors) {
            const $form = $(this._selectors.newRepForm);

            this._removeFormErrors();

            $form.find(':input').each((key, value) => {
                const fieldName = $(value).attr('name');
                const $wrapper = $(value).closest('.form-group');
                if(!errors[fieldName]) {
                    // no errors
                    return;
                }

                const $error = $('<span class="js-field-error help-block"></span>');
                $error.html(errors[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');

            });
        },

        _removeFormErrors() {
            const $form = $(this._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        },

        _clearForm() {
            const $form = $(this._selectors.newRepForm);
            this._removeFormErrors();
            $form[0].reset();
        },

        _addRow(repLog) {
            const tmpText = $('#js-rep-log-row-template').html();
            const tmp = _.template(tmpText);
            const html = tmp(repLog);
            this.$wrapper.find('tbody').append($.parseHTML(html));
            this.updateTotalWeightLifted();
        },

        _saveRepLog(data) {
            return $.ajax({
                url: Routing.generate('rep_log_new'),
                method: 'POST',
                data: JSON.stringify(data)
            }).then((data, textStatus, jqXHR) => {
                return $.ajax({
                    url: jqXHR.getResponseHeader('Location')
                });
            });
        }

    });

    let Helper = function($wrapper) {
            this.$wrapper = $wrapper;
        };
        $.extend(Helper.prototype, {
            calculateTotalWeight($wrapper) {
                let totalWeight = 0;
                $wrapper.find('tbody tr').each((key, value) => {
                    totalWeight += $(value).data('weight');
                });
                return totalWeight;
            },

            totalWeightString(maxWeight = 500) {
                const weight = this.calculateTotalWeight(this.$wrapper);
                if(weight > maxWeight) {
                    return maxWeight + '+' + ' lbs';
                }
                return weight;
            }
        });

})(window, jQuery, Routing, swal);