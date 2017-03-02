describe('ng1-init TEST SUITE\n', function(){
	describe('Testing IndexController\n', function(){
		it('\tshould initialize the title in the scope\n', function(){
			module('ng1-init');

			var vm;

			inject(function($controller){
				vm = $controller('IndexController');
			});

			expect(vm.title).toBeDefined();
			expect(vm.title).toBe('IndexController');
		});
	});
});