'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './poll.routes';

function Poll (obj){
  this._id = obj._id;
  this.creator = obj.creator;
  this.date = obj.date;
  this.question = obj.question || '';
  this.options = obj.options || [{text: '', votes:0, color: ''}, {text: '', votes: 0, color: ''}];
}

Poll.prototype.addOption = function(){
  this.options.push({text: '', votes: 0, color: ''});
}

Poll.prototype.removeOption = function(index){
  this.options.splice(index, 1)
}


export class PollComponent {
  /*@ngInject*/
  constructor($http, $scope, $location, Auth) {
    this.$location = $location;
    this.$http = $http;
    this.auth = Auth;
    this.id = $location.path().substr(6);
    //Chart
    this.ctx = document.getElementById('chart');
    this.chart = new Chart(this.ctx,{type:'pie'})
    //Poll Vars
    this.pollData = {};
    this.pollChoice;
    this.pollUrl;
    //Edit UI
    this.curUser;
    this.editAvailable = false;
    this.editing = false;
  }
  
  $onInit() {
    let self = this;
    if (this.id.length < 1){
     return this.$location.path('/');
    }
    localStorage.getItem(this.id);
    this.$http.get('/api/polls/'+this.id)
      .then(res => {
        this.pollData = new Poll(res.data);
        self.createChart(self.parsePollData(res.data));
        self.pollUrl = self.tweetStyle(res.data);
        this.auth.getCurrentUser()
          .then(user => {
            self.curUser = user._id;
            if (self.curUser == self.pollData.creator){
              self.editAvailable = true;
            }
          });
      })
    
      .catch(err => {

      })
  }
  
  parsePollData(raw) {
    let obj = {
      labels : [],
      data : [],
      colors: []
    },
        self = this,
        reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    raw.options.forEach(option => {
      obj.labels.push(option.text);
      obj.data.push(option.votes);
      (option.color && reg.test(option.color)) ? obj.colors.push(option.color) : obj.colors.push(self.getRandomColor());
    })
    return obj;
  }
  
  //Chart Ui
  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  createChart(obj) {
    this.chart = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: obj.labels,
        datasets: [{
          label: 'Votes',
          data: obj.data,
          backgroundColor: obj.colors
        }]
      }
    })
  }
  
  //Handle Voting
  canVote() {
    let a = localStorage.getItem(this.id);
    return !(typeof a == 'string');
  }
  
  postVote() {
    let self = this;
    if (!this.pollChoice){
      return;
    }
    this.$http.put('/api/polls/vote/'+this.id, {vote: this.pollChoice})
      .then(res => {
        self.voteToCookie()
        this.pollData = res.data;
        self.createChart(self.parsePollData(res.data));
      })
      .catch(err => {

      })
  }
  
  voteToCookie() {
    localStorage.setItem(this.id, 'true')
  }
  
  //Handle Toolbox
  tweetStyle(pd) {
    if('question' in pd){
      let title = pd.question;
      let url = ' > '+this.$location.absUrl();
      let final = '';
      let urlLen = url.length;
      let titleLen = title.length;

      if (urlLen + titleLen > 140){
        let overage = titleLen - ((urlLen+titleLen - 140)+3);
        final = title.substr(0, overage);
        final += '...';
        final += url
      } else {
        final = title + url;
      }

      return final;
    }
  }
  
  //Handle Editing
  toggleEditPoll() {
    this.editing = !this.editing;
  }
  
  removePollOption(index){
    this.pollData.removeOption(index);
  }
  
  addPollOption(){
    this.pollData.addOption();
  }
  
  saveEdit() {
    let self = this;
    this.$http.put('/api/polls/'+this.id, this.pollData)
      .then((res, n, err) => {
        document.location.reload()
      })
      .catch(err => {

      })
  }
  
  askDelete() {
    if (window.confirm("Are you sure you would like to delete this?")){
      this.saveDelete();
    }
  }
  
  saveDelete() {
    this.$http.delete('/api/polls/'+this.id)
      .then(doc => {
        this.$location.path('/');
      })
      .catch(err => {

      })
  }
}

export default angular.module('voterappApp.poll', [uiRouter])
  .config(routes)
  .component('poll', {
    template: require('./poll.html'),
    controller: PollComponent,
    controllerAs: 'pollCtrl'
  })
  .name;
