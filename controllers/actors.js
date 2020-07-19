const dataRepository = require('../database/repository');
const { responseMethod } = require('../helpers/responseMethod');

const getStreak = async (req, res) => {};

const getAllActors = async (req, res) => {
  try {
    const actors = await dataRepository.readTable('actors');
    res.status(200).json(actors);
  } catch (error) {
    console.log(error.message);
  }
};

const createActor = async (req, res) => {
  try {
    const { login, avatar_url, created_at } = req.body;
    const data = { login, avatar_url, created_at };
    const isExist = await dataRepository.readTable(
      'actors',
      `WHERE login = '${login}'`
    );
    if (isExist.length > 0)
      return responseMethod(res, 409, 'User with Login exists');
    const actor = await dataRepository.createRow('actors', data);
    res.status(201).json(actor);
  } catch (error) {
    console.log(error.message);
  }
};

const getActor = async (req, res) => {
  try {
    const actor = await dataRepository.getRow('actors', req.params.id);
    if (!actor) return responseMethod(res, 404, 'User dont exist');
    res.status(201).json(actor);
  } catch (error) {
    console.log(error.message);
  }
};

const updateActor = async (req, res) => {
  const { id, login, avatar_url } = req.body;

  if (!id || isNaN(id))
    return res.status(404).json({ message: 'Actor not found' }); // We do not want to tell the user it's a bad request

  try {
    const isExist = await dataRepository.getRow('actors', id);
    console.log('isExist', isExist);
    if (!isExist) return res.status(404).json({ message: 'Actor not found' });
    const updateActor = await dataRepository.updateRow(
      'actors',
      { login, avatar_url, created_at: isExist.created_at },
      isExist.id
    );
    res.status(200).json(updateActor);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteActor = async (req, res) => {
  try {
    const isExist = await dataRepository.getRow('actors', req.params.id);
    if (!isExist) return responseMethod(res, 404, 'Not Found');
    await dataRepository.deleteRow('actors', isExist.id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteActors = async (req, res) => {
  try {
    await dataRepository.deleteAllRows('actors');
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createActor,
  updateActor,
  getActor,
  getAllActors,
  getStreak,
  deleteActor,
  deleteActors,
};
