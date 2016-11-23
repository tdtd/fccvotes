'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('mypolls', {
      url: '/mypolls',
      template: '<mypolls></mypolls>'
    });
}
