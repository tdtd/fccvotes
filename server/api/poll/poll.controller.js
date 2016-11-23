/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/polls              ->  index
 * POST    /api/polls              ->  create
 * GET     /api/polls/:id          ->  show
 * PUT     /api/polls/:id          ->  upsert
 * PATCH   /api/polls/:id          ->  patch
 * DELETE  /api/polls/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Poll from './poll.model';
import Promise from 'bluebird';
import _ from 'lodash';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Polls
export function index(req, res) {
  var queries = req.query;
  let page = parseInt(queries.page, 10) || 0,
      limit = parseInt(queries.limit, 10) || 20;
  if (page < 0){
    page = 0;
  }
  if (limit < 0 || limit > 50){
    limit = 20;
  }
  
  return Poll.loadRecent(page, limit)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Poll from the DB
export function show(req, res) {
  return Poll.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function mypolls(req, res) {
  return Poll.loadMine({creator: req.user._id})
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Poll in the DB
export function create(req, res) {
  if (req.body.options.length < 1){
    return handleErr(res);
  }
  
  delete req.body.creator;
  delete req.body.date;
  delete req.body._id;
  
  let poll = new Poll(_.merge({creator: req.user._id}, req.body));
  return Poll.create(poll)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Allows user to vote on an entry via id and index
export function vote(req, res) {
  return Poll.findById(req.params.id).exec((err, doc) => {
    return new Promise((resolve, reject) => {
      doc.options[req.body.vote].votes++;
      return resolve(Poll.findOneAndUpdate({_id: req.params.id}, doc, {upsert: true, setDefaultsOnInsert: true, runValidators: true}))
    })
  })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Gets Poll by ID checks author and updates
export function updatePoll(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Poll.findOneAndUpdate({_id: req.params.id, creator: req.user._id}, req.body, {setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Upserts the given Poll in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Poll.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Poll in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Poll.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Poll from the DB
export function destroy(req, res) {
  return Poll.findOne({_id: req.params.id, creator: req.user._id}).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
