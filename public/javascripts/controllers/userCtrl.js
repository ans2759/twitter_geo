/**
 * Created by alexs on 11/11/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const UserCtrl = function (ResourceFactory, $state, ngToast) {
        console.log("UserCtrl init");

        const _this = this;
        _this.states = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID',
            'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
            'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
            'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];
        _this.months = [ '01 - January', '02 - February', '03 - March', '04 - April', '05 - May', '06 - June',
            '07 - July', '08 - August', '09 - September', '10 - October', '11 - November', '12 - December'];
        _this.years = [ 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 , 2027, 2028, 2029 ];
        _this.user = {};
        _this.paymentInfo = {};
        _this.showForm = true;

        ResourceFactory.getUser({}, function (response) {
            _this.user = response.user;
            _this.showForm = !_this.user.isMember || _this.user.validUntil < new Date().getTime();
        }, function (error) {
            console.error(error);
            $state.go('notAuthorized', {section: 'User'});
        });

        _this.billMonthly = function() {
            ResourceFactory.billMonthly({paymentInfo: _this.paymentInfo}, function(response) {
                _this.showForm = false;
                ngToast.success('Membership Successfully Updated!')
            }, function(response) {
                if (response.status === 400) {
                    ngToast.info(response.data.data)
                } else {
                    ngToast.danger("Error processing payment info")
                }
            })
        };

        _this.billYearly = function() {
            ResourceFactory.billYearly({paymentInfo: _this.paymentInfo}, function(response) {
                _this.showForm = false;
                ngToast.success('Membership Successfully Updated!')
            }, function(response) {
                if (response.status === 400) {
                    ngToast.info(response.data.data)
                } else {
                    ngToast.danger("Error processing payment info")
                }
            })
        };

        _this.submitEnabled = function() {
            return _this.paymentInfo.name && _this.paymentInfo.name !== '' && _this.paymentInfo.address && _this.paymentInfo.address !== ''
            && _this.paymentInfo.city && _this.paymentInfo.city !== '' && _this.paymentInfo.state && _this.paymentInfo.state !== ''
            && _this.paymentInfo.creditCard && _this.paymentInfo.creditCard !== '' && _this.paymentInfo.expiryMonth
            && _this.paymentInfo.expiryMonth !== 0 && _this.paymentInfo.expiryMonth < 13 && _this.paymentInfo.ccv && _this.paymentInfo.ccv !== ''
            && _this.paymentInfo.expiryYear && _this.paymentInfo.expiryYear > 2018 && _this.paymentInfo.expiryYear < 2030
        }
    };
    UserCtrl.$inject = ['ResourceFactory', '$state', 'ngToast'];
    app.controller('UserCtrl', UserCtrl);
}());