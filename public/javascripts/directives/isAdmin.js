(function () {
    'use strict';
    const app = angular.module('app');
    const IsAdmin = function (ResourceFactory) {
        console.log("IsAdmin init");

        return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
                ResourceFactory.isAdmin({}, function (result) {
                    if (result.isAdmin === true) {
                        element.show();
                    } else {
                        element.hide();
                    }
                });
            }
        }
    };
    IsAdmin.$inject = ['ResourceFactory'];
    app.directive("isAdmin", IsAdmin)
}());