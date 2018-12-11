'use strict';

(function(window, $, Routing, swal) {

    let helperInstances = new WeakMap();

    class RepLogApp {

        constructor($wrapper) {
                    this.repLogs = [];
                    this.$wrapper = $wrapper;
                    helperInstances.set(this, new Helper(this.repLogs));
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

        static get _selectors() {
            return {
                newRepForm: '.js-rep-log-form',
            };
        }

        loadRepLogs() {
            $.ajax({
                url: Routing.generate('rep_log_list')
            }).then(data => {
                    for(let item of data.items) {
                        this._addRow(item);
                    }
            });
        }

        updateTotalWeightLifted() {
            const totalWeight = helperInstances.get(this).totalWeightString();
            this.$wrapper.find('.js-total-weight').html(totalWeight);
        }

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
        }

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
        }

        handleRowClick() {
            console.log('row clicked');
        }

        handleNewFormSubmit(e) {
            e.preventDefault();
            const $form = $(RepLogApp._selectors.newRepForm);
            const formData = {};
            for(let fieldData of $form.serializeArray()) {
                formData[fieldData.name] = fieldData.value;
            }
            this._saveRepLog(formData).then(data => {
                this._clearForm();
                this._addRow(data);
            }).catch(jqXHR => {
                const errorData = $.parseJSON(jqXHR.responseText);
                this._mapErrorsToForm(errorData.errors);
            });
        }

        _mapErrorsToForm(errors) {
            const $form = $(RepLogApp._selectors.newRepForm);

            this._removeFormErrors();
            for(let value of $form.find(':input')) {
                const fieldName = $(value).attr('name');
                const $wrapper = $(value).closest('.form-group');
                if(!errors[fieldName]) {
                    // no errors
                    continue;
                }

                const $error = $('<span class="js-field-error help-block"></span>');
                $error.html(errors[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');

            }
        }

        _removeFormErrors() {
            const $form = $(RepLogApp._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        }

        _clearForm() {
            const $form = $(RepLogApp._selectors.newRepForm);
            this._removeFormErrors();
            $form[0].reset();
        }

        _addRow(repLog) {
            this.repLogs.push(repLog);
            const html = rowTemplate(repLog);
            this.$wrapper.find('tbody').append($.parseHTML(html));
            this.updateTotalWeightLifted();
        }

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

    }

    class Helper {

        constructor(repLogs) {
                this.repLogs = repLogs;
            }

        calculateTotalWeight(repLogs) {
            return Helper._calculateWeight(repLogs);
        }

        static _calculateWeight(repLogs) {
            let totalWeight = 0;
            for(let repLog of repLogs) {
                totalWeight += repLog.totalWeightLifted;
            }
            return totalWeight;
        }

        totalWeightString(maxWeight = 500) {
            const weight = this.calculateTotalWeight(this.repLogs);
            if(weight > maxWeight) {
                return maxWeight + '+' + ' lbs';
            }
            return weight;
        }

    }


    const rowTemplate = (repLog) => `<tr data-weight="${repLog.totalWeightLifted}">
            <td>${repLog.itemLabel}</td>
            <td>${repLog.reps}</td>
            <td>${repLog.totalWeightLifted}</td>
            <td>
                <a href="#" class="js-delete-rep-log" data-url="${repLog.links._self}">
                    <span class="fa fa-trash"></span>
                </a>
            </td>
        </tr>`;

    window.RepLogApp = RepLogApp;

})(window, jQuery, Routing, swal);