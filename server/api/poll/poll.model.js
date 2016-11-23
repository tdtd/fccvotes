'use strict';

import mongoose from 'mongoose';
let Schema = mongoose.Schema;
import Promise from 'bluebird';
import shortid from 'shortid';

var PollSchema = new mongoose.Schema({
  _id:{
    type: String,
    'default': shortid.generate
  },
  question: {type: String},
  options: {type: Array},
  date: { type: Date, default: Date.now },
  voters: {
    type: [Schema.Types.ObjectId]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

PollSchema.statics = {
  loadRecent: function(pag, limit) {
    let self = this;
    return new Promise(function(resolve, reject){
      self.find({})
        .populate({path:'creator', select: 'name'})
        .select('creator question date')
        .sort('-date')
        .skip(pag * limit)
        .limit(limit)
        .exec(function(err, doc){
          return resolve(doc)
        });
    })
  },
	loadMine: function(param) {
    let self = this;
    return new Promise(function(resolve, reject){
      self.find(param)
        .populate({path:'creator', select: 'name'})
        .sort('-date')
        .exec(function(err,doc){
          return resolve(doc);
      });
    })
  }
};

export default mongoose.model('Poll', PollSchema);
