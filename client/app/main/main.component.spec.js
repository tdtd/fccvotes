'use strict';

describe('Component: MainComponent', function() {
  // load the controller's module
  beforeEach(module('voterappApp.main'));

  var MainComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MainComponent = $componentController('main', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
