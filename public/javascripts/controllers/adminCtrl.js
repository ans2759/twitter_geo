/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const AdminCtrl = function (ResourceFactory, $state, map, ngToast) {
        console.log("AdminCtrl init");

        const _this = this;
        _this.boundingInfo = {};
        _this.users = [];
        _this.userSearch = '';

        ResourceFactory.isAdmin({}, function(response) {
            if (response.isAdmin === true) {
                initPage();
            } else {
                $state.go('notAuthorized', {section: 'Administration'});
            }
        }, function (err) {
            console.error("Error determining admin status", err)
        });

        function initPage() {
            ResourceFactory.getBoundingInfo({}, function(response) {
                _this.boundingInfo = response;
            }, function (err){
                console.error("Error retrieving bounging info", err)
            });

            _this.getUsers();
        }

        _this.showCenter = function() {
            ResourceFactory.getCenter({
                lowerLeftLat: _this.boundingInfo.lowerLeft.lat,
                lowerLeftLng: _this.boundingInfo.lowerLeft.lng,
                upperRightLat: _this.boundingInfo.upperRight.lat,
                upperRightLng: _this.boundingInfo.upperRight.lng
            }, function(result) {
                map.setCenter(result.lat, result.lng);
            });
        };

        _this.getUsers = function(){
            ResourceFactory.getUsers({}, function (response) {
                _this.users = response;
            });
        };

        _this.filterUsers = function(user) {
            return user.username.toLowerCase().indexOf(_this.userSearch.toLowerCase()) !== -1 ||
                user.displayName.toLowerCase().indexOf(_this.userSearch.toLowerCase()) !== -1;
        };

        _this.deleteUser = function(user) {
            ResourceFactory.deleteUser({id: user._id}, function(response) {
                ngToast.success(user.username + ' successfully deleted');
                _this.getUsers();
            }, function(error) {
                console.error("Error deleting user", error);
                ngToast.danger(user.username + " not deleted");
            });
        };

        _this.changeAdminStatus = function(user) {
            ResourceFactory.changeAdminStatus({id: user._id, isAdmin: !user.isAdmin}, function(response) {
                ngToast.success(user.username + "successfully updated");
                _this.getUsers();
            }, function(errpr) {
                ngToast.danger(user.username + " not updated");
            })
        }
    };
    AdminCtrl.$inject = ['ResourceFactory', '$state', 'map', 'ngToast'];
    app.controller('AdminCtrl', AdminCtrl);
}());