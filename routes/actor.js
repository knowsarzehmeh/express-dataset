var express = require('express');
var router = express.Router();

const {
  createActor,
  getAllActors,
  getStreak,
  updateActor,
} = require('../controllers/actors');

// Routes related to actor.
router.post('/', createActor);
router.get('/', getAllActors);
router.get('/actors/streak', getStreak);
router.put('/', updateActor);
module.exports = router;
