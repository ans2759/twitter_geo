/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const UserCtrl = function (ResourceFactory, $state, ngToast) {
        console.log("UserCtrl init");

        const _this = this;
        _this.user = {};
        _this.showForm = false;

        ResourceFactory.getUser({}, function (response) {
            _this.user = response.user;
            _this.showForm = !_this.user.isMember || !_this.user.validUntil < new Date().getTime();
        }, function (error) {
            console.error(error);
            $state.go('notAuthorized', {section: 'User'});
        });
    };
    UserCtrl.$inject = ['ResourceFactory', '$state', 'ngToast'];
    app.controller('UserCtrl', UserCtrl);
}());