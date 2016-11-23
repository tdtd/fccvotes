'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './main.routes';

function ErrorHandler(){
  this.errors = [];
}

ErrorHandler.prototype.addError = function(type, msg){
  this.errors.push({type:type, msg: msg}); 
}

function Poll (obj){
  this.question = obj.question || '';
  this.options = obj.options || [{text: '', votes:0, color: ''}, {text: '', votes: 0, color: ''}];
}

Poll.prototype.addOption = function(){
  this.options.push({text: '', votes: 0, color: ''});
}

Poll.prototype.removeOption = function(index){
  this.options.splice(index, 1)
}

export class MainComponent {
  /*@ngInject*/
  constructor($http, $scope, $timeout, $location, socket) {
    this.$http = $http;
    this.socket = socket;
    this.timeout = $timeout;
    this.location = $location;
    this.header = {};
    //Vars
    this.polls;
    //Object Handling
    this.errors = new ErrorHandler();
    this.newPoll = new Poll({});
    //UI Toggles
    this.found = false;
    this.formActive = false;
    this.page = 0;
    //Socket.io handling
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('poll');
    });
  }
  
  $onInit() {
    var self = this;
    this.$http.get('/api/polls?limit=20&page=0')
      .then(response => {
        this.polls = response.data;
        this.socket.syncUpdates('poll', this.polls, function(event, poll, polls){
          polls.sort(function(a,b){
            a = new Date(a.date);
            b = new Date(b.date);
            return a>b ? -1 : a<b ? 1 : 0;
          })
        });
        self.found = true;
      });
   }
  
  deltaPage (delt){
    if (this.page + delt < 0){
      this.page = 0;
    } else {
      this.page += delt;
    }
    this.updatePage()
  }
  
  isMaxPage (){
    if (!this.polls){
      return false;
    }
    return (this.polls.length < 20);
  }
  
  updatePage() {
    let self = this;
    self.found = false;
    this.$http.get('/api/polls?limit=20&page='+this.page)
      .then(response => {
        this.polls = response.data;
        self.found = true;
      });
  }
  
  goto(loc) {
    this.location.path(loc);
  }
  
  createNewPoll() {
    this.newPoll = new Poll();
  }
  
  postPoll() {
    var self = this;
    this.$http.post('/api/polls', this.newPoll)
      .then(res => {
        self.goto('/poll/'+res.data._id);
      })
      .catch(err => {
        self.errors.addError('danger', 'An error has occured.')
      })
  }
  
  toggleForm() {
    this.formActive = !this.formActive;
  }
}

export default angular.module('voterappApp.main', [uiRouter])
  .config(routes)
  .component('main', {
    template: require('./main.html'),
    controller: MainComponent,
    controllerAs: 'mCtrl'
  })
  .name;
