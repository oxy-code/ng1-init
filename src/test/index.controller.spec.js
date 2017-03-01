describe('ng1-init TEST SUITE', function(){
	describe('Testing IndexController', function(){
		it('should initialize the title in the scope', function(){
			module('ng1-init');

			var scope = {};
			var ctrl;

			inject(function($controller){
				ctrl = $controller('IndexController', {this: scope});
			});

			expect(scope.title).toBeDefined();
			expect(scope.title).toBe('IndexController');
		});
	});
});