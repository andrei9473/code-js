'use strict';

(function(window, $) {
    window.RepLogApp = function($wrapper) {
                this.$wrapper = $wrapper;
                this.helper = new Helper($wrapper);
                this.$wrapper.find('.js-delete-rep-log').on('click',
                    this.handleRepLogDelete.bind(this)
                );
                this.$wrapper.find('tbody tr').on('click',
                    this.handleRowClick.bind(this)
                );
                this.$wrapper.find('.js-rep-log-form').on('submit',
                    this.handleNewFormSubmit.bind(this)
                );
            }
    $.extend(RepLogApp.prototype, {

        updateTotalWeightLifted: function() {
            var totalWeight = this.helper.calculateTotalWeight(this.$wrapper)
            this.$wrapper.find('.js-total-weight').html(totalWeight);
        },

        handleRepLogDelete: function(e) {
            e.preventDefault();
            $(e.currentTarget).find(".fa")
            .removeClass("fa-trash")
            .addClass("fa-spinner")
            .addClass("fa-spin");
            var deleteUrl = $(e.currentTarget).data('url');
            var $row = $(e.currentTarget).closest('tr');
            var self = this;
            $.ajax({
                url: deleteUrl,
                method: "DELETE",
                success: function() {
                    $row.fadeOut('normal', function() {
                        $row.remove();
                        self.updateTotalWeightLifted();
                    });
                }
            });
        },

        handleRowClick: function() {
            console.log('row clicked');
        },

        handleNewFormSubmit: function(e) {
            e.preventDefault();
            var $form = $(e.currentTarget);
            var $tbody = this.$wrapper.find('tbody');
            $.ajax({
                url: $form.attr('action'),
                method: 'POST',
                data: $form.serialize(),
                success: function(data) {
                    $tbody.append(data);
                },
                error: function(jqXHR) {
                    $form.closest('.js-new-rep-log-form-wrapper')
                        .html(jqXHR.responseText);
                }
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

})(window, jQuery);