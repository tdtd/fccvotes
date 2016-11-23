'use strict';

describe('Component: MypollsComponent', function() {
  // load the controller's module
  beforeEach(module('voterappApp.mypolls'));

  var MypollsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MypollsComponent = $componentController('mypolls', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
