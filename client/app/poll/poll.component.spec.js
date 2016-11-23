'use strict';

describe('Component: PollComponent', function() {
  // load the controller's module
  beforeEach(module('voterappApp.poll'));

  var PollComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    PollComponent = $componentController('poll', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
