'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './mypolls.routes';

export class MypollsComponent {
  /*@ngInject*/
  constructor($http) {
    this.http = $http;
    this.found = false;
    this.polls = [];
  }
  
  $onInit() {
    this.http.get('/api/polls/mypolls')
      .then(res => {
        this.polls = res.data;
        this.found = true;
      })
      .catch(err => {

      })
  }
}

export default angular.module('voterappApp.mypolls', [uiRouter])
  .config(routes)
  .component('mypolls', {
    template: require('./mypolls.html'),
    controller: MypollsComponent,
    controllerAs: 'mypollsCtrl'
  })
  .name;
