const repository = require('../database/repository');
const { Date } = require('../helpers/formatDate');

var getAllEvents = async (req, res) => {
  const orderBy = ' ORDER BY id ASC';
  const eventRecords = await repository.readTable('events', ' ', orderBy);

  res.status(200).json(eventRecords);
};

var addEvent = async (req, res) => {
  const { id, type, created_at, actor, repo } = req.body;

  const eventType = {
    pushEvent: 'pushevent',
    pullEvent: 'pullevent',
  };

  //   check if the event has been created
  try {
    if (!id) {
      throw new Error('Bad Request');
    }

    // check if the event type is empty
    if (!Object.values(eventType).includes(type.toLowerCase())) {
      throw new Error('Event Type is invalid');
    }

    // validate actor
    if (!actor || !actor.hasOwnProperty('id')) {
      throw new Error('Actor cannot be empty');
    }
    // validate repo
    if (!repo || !repo.hasOwnProperty('id')) {
      throw new Error('Repo cannot be empty');
    }

    // checking if the event exists
    const eventRecord = await repository.getRow('events', id);
    console.log(eventRecord);
    if (eventRecord) {
      throw new Error('Event already Exist');
    }

    // check if actor & exists
    let actorRecord = await repository.getRow('actors', actor.id);
    let repoRecord = await repository.getRow('repos', repo.id);

    console.log('Actor Recored', actorRecord);

    if (!actorRecord) {
      actorRecord = await repository.createRow('actors', {
        ...actor,
      });
      console.log('actor has been created');

      if (!repoRecord) {
        repoRecord = await repository.createRow('repos', {
          ...repo,
          actor_id: actorRecord.id,
        });
        console.log('repo has been created');
      }
    }

    // create the actor, repo and event
    if (actorRecord && repoRecord) {
      // create event
      const eventData = {
        id,
        type,
        created_at,
        actor_id: actorRecord.id,
        repo_id: repoRecord.id,
      };
      const newEventRecord = await repository.createRow('events', eventData);

      if (newEventRecord) {
        return res.sendStatus(201);
      }
    }

    // create a
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

var getByActor = async (req, res) => {
  const { actorID } = req.params;

  if (!actorID || isNaN(actorID))
    return res.status(400).json({ message: 'Invalid  Actor id' });

  let actor = await repository.getRow('actors', actorID);

  if (!actor) return res.status(400).json({ message: ' Invalid Actor' });

  const condition = `WHERE events.actor_id = ${actor.id}`;
  let eventsByActor = await repository.readTable('events', condition);

  eventsByActor = await Promise.all(
    eventsByActor.map(async (event) => {
      const repo = await repository.getRow('repos', event.repo_id);
      const { id, type, created_at } = event;
      return {
        id,
        type,
        actor,
        repo,
        created_at,
      };
    })
  );

  res.send(eventsByActor);
};

var eraseEvents = async (req, res) => {
  const deleteRows = await repository.deleteAllRows('events');

  // All rows has been deleted
  if (Object.keys(deleteRows).length === 0) {
    res.sendStatus(200);
  }
};

module.exports = {
  getAllEvents: getAllEvents,
  addEvent: addEvent,
  getByActor: getByActor,
  eraseEvents: eraseEvents,
};
