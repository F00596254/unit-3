const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('./server.js');
const playerSchema = new mongoose.Schema({
    name: String,
    position: String,
    rushingYards: Number,
    touchdownsThrown: Number,
    sacks: Number,
    madeFieldGoals: Number,
    missedFieldGoals: Number,
    catches: Number,
});

const Player = mongoose.model('team_players', playerSchema);

const request = supertest(app);

const testDatabaseUrl = 'mongodb://localhost:27017/football_stats_db';

describe('Player API Unit Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(testDatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();

  });

  beforeEach(async () => {
    await Player.deleteMany({});
  });

  describe('POST /addPlayer', () => {
    it('should add a new player', async () => {
      const newPlayer = {
        name: 'John Doe',
        position: 'Quarterback',
        rushingYards: 500,
        touchdownsThrown: 10,
        sacks: 5,
        madeFieldGoals: 20,
        missedFieldGoals: 3,
        catches: 30,
      };

      const response = await request
        .post('/addPlayer')
        .send(newPlayer);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Player added successfully');
      expect(response.body.player).toHaveProperty('name', newPlayer.name);
    });
  });

  describe('PUT /updatePlayer/:playerName', () => {
    it('should update an existing player', async () => {
      const existingPlayer = new Player({
        name: 'Jane Doe',
        position: 'Wide Receiver',
        rushingYards: 300,
        touchdownsThrown: 5,
        sacks: 2,
        madeFieldGoals: 10,
        missedFieldGoals: 1,
        catches: 40,
      });

      await existingPlayer.save();

      const updatedData = {
        touchdownsThrown: 8,
        catches: 50,
      };

      const response = await request
        .put(`/updatePlayer/${existingPlayer.name}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(`Player ${existingPlayer.name} updated successfully`);
      expect(response.body.modifiedCount).toBe(1);
    });
  });


  describe('DELETE /deletePlayer/:playerName', () => {
    it('should delete an existing player', async () => {
      const existingPlayer = new Player({
        name: 'Michael Jordan',
        position: 'Basketball Player',
        rushingYards: 0,
        touchdownsThrown: 0,
        sacks: 0,
        madeFieldGoals: 0,
        missedFieldGoals: 0,
        catches: 0,
      });

      await existingPlayer.save();

      const response = await request
        .delete(`/deletePlayer/${existingPlayer.name}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(`Player ${existingPlayer.name} deleted successfully`);
      expect(response.body.deletedCount).toBe(1);
    });
  });

  describe('GET /performQuery/:queryType', () => {
    it('should return player with most touchdowns', async () => {
      const players = [
        { name: 'Player1', touchdownsThrown: 5 },
        { name: 'Player2', touchdownsThrown: 8 },
        { name: 'Player3', touchdownsThrown: 3 },
      ];

      await Player.insertMany(players);

      const response = await request
        .get('/performQuery/mostTouchdowns');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Player2');
    });

  });


});


