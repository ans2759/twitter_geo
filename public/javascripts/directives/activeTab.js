(function () {
    'use strict';
    const app = angular.module('app');
    const ActiveTab = function () {
        console.log("ActiveTab init");

        return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
                element.on('click', () => {
                    scope.currentTab = attrs.activeTab;
                });

                scope.$watch('currentTab', (newVal, oldVal) => {
                    if (attrs.activeTab === scope.currentTab) {
                        element.addClass('active');
                    } else if (scope.currentTab) {
                        element.removeClass('active')
                    }
                });
            }
        }
    };
    ActiveTab.$inject = [];
    app.directive("activeTab", ActiveTab)
}());