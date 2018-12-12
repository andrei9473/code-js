'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window, $, Routing, swal) {

    var helperInstances = new WeakMap();

    var RepLogApp = function () {
        function RepLogApp($wrapper) {
            _classCallCheck(this, RepLogApp);

            this.repLogs = [];
            this.$wrapper = $wrapper;
            helperInstances.set(this, new Helper(this.repLogs));
            this.loadRepLogs();
            this.$wrapper.on('click', '.js-delete-rep-log', this.handleRepLogDelete.bind(this));
            this.$wrapper.on('click', 'tbody tr', this.handleRowClick.bind(this));
            this.$wrapper.on('submit', '.js-rep-log-form', this.handleNewFormSubmit.bind(this));
        }

        _createClass(RepLogApp, [{
            key: 'loadRepLogs',
            value: function loadRepLogs() {
                var _this = this;

                $.ajax({
                    url: Routing.generate('rep_log_list')
                }).then(function (data) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = data.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var item = _step.value;

                            _this._addRow(item);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                });
            }
        }, {
            key: 'updateTotalWeightLifted',
            value: function updateTotalWeightLifted() {
                var totalWeight = helperInstances.get(this).totalWeightString();
                this.$wrapper.find('.js-total-weight').html(totalWeight);
            }
        }, {
            key: 'handleRepLogDelete',
            value: function handleRepLogDelete(e) {
                var _this2 = this;

                e.preventDefault();
                var $link = $(e.currentTarget);
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
                    preConfirm: function preConfirm() {
                        return _this2._deleteRepLog($link);
                    }
                }).then(function (result) {
                    if (result.dismiss === swal.DismissReason.cancel) {
                        console.log('Canceled!!!');
                    }
                });
            }
        }, {
            key: '_deleteRepLog',
            value: function _deleteRepLog($link) {
                var _this3 = this;

                $link.find(".fa").removeClass("fa-trash").addClass("fa-spinner").addClass("fa-spin");
                var url = $link.data('url');
                var $row = $link.closest('tr');
                $.ajax({
                    url: url,
                    method: "DELETE"
                }).then(function () {
                    $row.fadeOut('normal', function () {
                        $row.remove();
                        _this3.updateTotalWeightLifted();
                    });
                });
            }
        }, {
            key: 'handleRowClick',
            value: function handleRowClick() {
                console.log('row clicked');
            }
        }, {
            key: 'handleNewFormSubmit',
            value: function handleNewFormSubmit(e) {
                var _this4 = this;

                e.preventDefault();
                var $form = $(RepLogApp._selectors.newRepForm);
                var formData = {};
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = $form.serializeArray()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var fieldData = _step2.value;

                        formData[fieldData.name] = fieldData.value;
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this._saveRepLog(formData).then(function (data) {
                    _this4._clearForm();
                    _this4._addRow(data);
                }).catch(function (jqXHR) {
                    var errorData = $.parseJSON(jqXHR.responseText);
                    _this4._mapErrorsToForm(errorData.errors);
                });
            }
        }, {
            key: '_mapErrorsToForm',
            value: function _mapErrorsToForm(errors) {
                var $form = $(RepLogApp._selectors.newRepForm);

                this._removeFormErrors();
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = $form.find(':input')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var value = _step3.value;

                        var fieldName = $(value).attr('name');
                        var $wrapper = $(value).closest('.form-group');
                        if (!errors[fieldName]) {
                            // no errors
                            continue;
                        }

                        var $error = $('<span class="js-field-error help-block"></span>');
                        $error.html(errors[fieldName]);
                        $wrapper.append($error);
                        $wrapper.addClass('has-error');
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
        }, {
            key: '_removeFormErrors',
            value: function _removeFormErrors() {
                var $form = $(RepLogApp._selectors.newRepForm);
                $form.find('.js-field-error').remove();
                $form.find('.form-group').removeClass('has-error');
            }
        }, {
            key: '_clearForm',
            value: function _clearForm() {
                var $form = $(RepLogApp._selectors.newRepForm);
                this._removeFormErrors();
                $form[0].reset();
            }
        }, {
            key: '_addRow',
            value: function _addRow(repLog) {
                this.repLogs.push(repLog);
                var html = rowTemplate(repLog);
                this.$wrapper.find('tbody').append($.parseHTML(html));
                this.updateTotalWeightLifted();
            }
        }, {
            key: '_saveRepLog',
            value: function _saveRepLog(data) {
                return $.ajax({
                    url: Routing.generate('rep_log_new'),
                    method: 'POST',
                    data: JSON.stringify(data)
                }).then(function (data, textStatus, jqXHR) {
                    return $.ajax({
                        url: jqXHR.getResponseHeader('Location')
                    });
                });
            }
        }], [{
            key: '_selectors',
            get: function get() {
                return {
                    newRepForm: '.js-rep-log-form'
                };
            }
        }]);

        return RepLogApp;
    }();

    var Helper = function () {
        function Helper(repLogs) {
            _classCallCheck(this, Helper);

            this.repLogs = repLogs;
        }

        _createClass(Helper, [{
            key: 'calculateTotalWeight',
            value: function calculateTotalWeight(repLogs) {
                return Helper._calculateWeight(repLogs);
            }
        }, {
            key: 'totalWeightString',
            value: function totalWeightString() {
                var maxWeight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;

                var weight = this.calculateTotalWeight(this.repLogs);
                if (weight > maxWeight) {
                    return maxWeight + '+' + ' lbs';
                }
                return weight;
            }
        }], [{
            key: '_calculateWeight',
            value: function _calculateWeight(repLogs) {
                var totalWeight = 0;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = repLogs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var repLog = _step4.value;

                        totalWeight += repLog.totalWeightLifted;
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                return totalWeight;
            }
        }]);

        return Helper;
    }();

    var rowTemplate = function rowTemplate(repLog) {
        return '<tr data-weight="' + repLog.totalWeightLifted + '">\n            <td>' + repLog.itemLabel + '</td>\n            <td>' + repLog.reps + '</td>\n            <td>' + repLog.totalWeightLifted + '</td>\n            <td>\n                <a href="#" class="js-delete-rep-log" data-url="' + repLog.links._self + '">\n                    <span class="fa fa-trash"></span>\n                </a>\n            </td>\n        </tr>';
    };

    window.RepLogApp = RepLogApp;
})(window, jQuery, Routing, swal);
