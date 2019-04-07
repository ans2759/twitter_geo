(function () {
    'use strict';
    const app = angular.module('app');
    const ActiveTab = function ($location, $transitions) {
        console.log("ActiveTab init");

        return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
                function update() {
                    if ($location.path().includes(attrs.activeTab)) {
                        element.addClass('active');
                    } else {
                        element.removeClass('active')
                    }
                }

                update();

                $transitions.onSuccess({}, function(transition) {
                    update()
                });
            }
        }
    };
    ActiveTab.$inject = ['$location', '$transitions'];
    app.directive("activeTab", ActiveTab)
}());