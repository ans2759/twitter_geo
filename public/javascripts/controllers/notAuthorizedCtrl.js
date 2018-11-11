/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const NotAuthorizedCtrl = function ($stateParams) {
        console.log("NotAuthorizedCtrl init");

        const _this = this;
        _this.section = $stateParams.section;
    };
    NotAuthorizedCtrl.$inject = ['$stateParams'];
    app.controller('NotAuthorizedCtrl', NotAuthorizedCtrl);
}());