/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const AdminCtrl = function (ResourceFactory, $state) {
        console.log("AdminCtrl init");

        const _this = this;

        ResourceFactory.isAdmin({}, function(response) {
            if (response.isAdmin === true) {

            } else {
                $state.go('notAuthorized', {section: 'Administration'});
            }
        }, function (err) {
            console.error("Error determining admin status", err)
        });
    };
    AdminCtrl.$inject = ['ResourceFactory', '$state'];
    app.controller('AdminCtrl', AdminCtrl);
}());