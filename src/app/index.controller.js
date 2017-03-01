(function() {
    'use strict';
    /**
	 * Main controller
	 */
    angular
        .module('ng1-init')
        .controller('IndexController', IndexController);

    /* @ngInject */
    function IndexController() {
        var vm = this;
        vm.title = 'IndexController';

        ////////////////

    }
})();
