'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('poll', {
      url: '/poll/:id',
      template: '<poll></poll>'
    });
}
