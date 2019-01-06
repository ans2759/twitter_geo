/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const AdminCtrl = function (ResourceFactory, $state, map, ngToast, StreamConnected, MessageBus, FileUploader) {
        console.log("AdminCtrl init");

        const _this = this;
        _this.boundingInfo = {};
        let originalBoundingInfo = {};
        _this.users = [];
        _this.userSearch = '';
        _this.showUsersLoader = true;
        _this.showBoundingInfoLoader = true;
        _this.streamConnected = false;
        _this.confirmMessage = '';
        _this.changeAdminAction = 'UPDATE_ADMIN';
        _this.deleteUserAction = 'DELETE_USER';
        _this.updateCornersAction = 'UPDATE_CORNERS';
        _this.uploader = new FileUploader({
            url: '/uploadStopWords',
            removeAfterUpload: true
        });
        let action = '';
        let selectedUser = {};

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
            MessageBus.subscribe(MessageBus.events.CONNECTION_UPDATE, (event, data) => {
                _this.streamConnected = data.connected;
            });
            StreamConnected.startPolling();
            _this.getBoundingInfo();
            _this.getUsers();
            _this.isStreamConnected();
            initFileUpload();
        }

        const initFileUpload = () => {
            //Limit upload queue to 1 item
            _this.uploader.filters.push({
                name: 'syncFilter',
                fn: function(item, options) {
                    if (this.queue.length > 0) {
                        this.queue = [];
                    }
                    return true;
                }
            });

            _this.uploader.onSuccessItem  = function(fileItem, response, status, headers) {
                ngToast.success("Stop-words file uploaded successfully")
            };

            _this.uploader.onErrorItem = function(fileItem, response, status, headers) {
                console.error("Error uploading stop-words", response);
                ngToast.danger("Error uploading stop-words file: " + response.data);
            };
        }

        _this.getBoundingInfo = function() {
            ResourceFactory.getBoundingInfo({}, function(response) {
                _this.showBoundingInfoLoader = false;
                _this.boundingInfo = response;
                angular.copy(_this.boundingInfo, originalBoundingInfo);
            }, function (err){
                console.error("Error retrieving bounging info", err)
            });
        };

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
                _this.showUsersLoader = false;
            });
        };

        _this.filterUsers = function(user) {
            return user.username.toLowerCase().indexOf(_this.userSearch.toLowerCase()) !== -1 ||
                user.displayName.toLowerCase().indexOf(_this.userSearch.toLowerCase()) !== -1;
        };

        _this.deleteUser = function(user) {
            _this.showUsersLoader = true;
            ResourceFactory.deleteUser({id: user._id}, function(response) {
                ngToast.success(user.username + ' successfully deleted');
                _this.getUsers();
            }, function(error) {
                console.error("Error deleting user", error);
                ngToast.danger(user.username + " not deleted");
            });
        };

        _this.changeAdminStatus = function(user) {
            _this.showUsersLoader = true;
            ResourceFactory.changeAdminStatus({id: user._id, isAdmin: !user.isAdmin}, function(response) {
                ngToast.success(user.username + " successfully updated");
                _this.getUsers();
            }, function(errpr) {
                ngToast.danger(user.username + " not updated");
            })
        };

        _this.updateCorners = function() {
            _this.showBoundingInfoLoader = true;
            ResourceFactory.updateCorners({boundingInfo: _this.boundingInfo}, function(response) {
                _this.showBoundingInfoLoader = false;
                ngToast.success("Bounding info successfully updated");
            }, function(error) {
                _this.showBoundingInfoLoader = false;
                ngToast.danger(error.data);
            });
        };

        _this.boundingInfoChanged = function() {
            return _this.boundingInfo.lowerLeft.lat !== originalBoundingInfo.lowerLeft.lat
                || _this.boundingInfo.lowerLeft.lng !== originalBoundingInfo.lowerLeft.lng
                || _this.boundingInfo.upperRight.lat !== originalBoundingInfo.upperRight.lat
                || _this.boundingInfo.upperRight.lng !== originalBoundingInfo.upperRight.lng;
        };

        _this.showConfirmModal = function (proposedAction, user) {
            switch (proposedAction) {
                case _this.changeAdminAction:
                    _this.confirmMessage = 'Update user ' + user.username + '\'s admin status?';
                    action = proposedAction;
                    selectedUser = user;
                    break;
                case _this.deleteUserAction:
                    _this.confirmMessage = 'Delete user ' + user.username + '?';
                    action = proposedAction;
                    selectedUser = user;
                    break;
                case _this.updateCornersAction:
                    _this.confirmMessage = 'Set coordinates?';
                    action = proposedAction;
                    break;
                default:
                    console.error("invalid action");
            }
        };

        _this.performAction = function() {
            switch(action) {
                case _this.changeAdminAction:
                    _this.changeAdminStatus(selectedUser);
                    break;
                case _this.deleteUserAction:
                    _this.deleteUser(selectedUser);
                    break;
                case _this.updateCornersAction:
                    _this.updateCorners();
                    break;
                default:
                    console.error("invalid action");
            }
            action = '';
            selectedUser = {};
        };

        _this.closeConfirmModal = function() {
            action = '';
            selectedUser = {};
        };

        _this.isStreamConnected = function() {
            _this.streamConnected = StreamConnected.isStreamConnected();
        };

        _this.connectStream = function() {
            ResourceFactory.connectStream({}, function() {
                ngToast.success("Twitter stream connection initiated")
            }, function (error) {
                ngToast.danger(error.data);
            });
        };

        _this.closeStream = function() {
            ResourceFactory.closeStream({}, function() {
                ngToast.success("Twitter stream connection closed")
            }, function (error) {
                ngToast.danger(error.data);
            });
        };
    };
    AdminCtrl.$inject = ['ResourceFactory', '$state', 'map', 'ngToast', 'StreamConnected', 'MessageBus', 'FileUploader'];
    app.controller('AdminCtrl', AdminCtrl);
}());