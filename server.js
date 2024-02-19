const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 8081;
const mongoUrl = 'mongodb://localhost:27017/football_stats_db';

app.use(bodyParser.json());

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');

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

   app.get('/performQuery/:queryType', async (req, res) => {
      const queryType = req.params.queryType;
      
      try {
         let result;
   
         switch (queryType) {
            case 'mostTouchdowns':
               result = await Player.find().sort({ touchdownsThrown: -1 }).limit(1);
               break;
            case 'mostRushingYards':
               result = await Player.find().sort({ rushingYards: -1 }).limit(1);
               break;
            case 'leastRushingYards':
               result = await Player.find().sort({ rushingYards: 1 }).limit(1);
               break;
            case 'fewestFieldGoals':
               result = await Player.find().sort({ madeFieldGoals: -1 });
               break;
            case 'mostNumberOfSacks':
               result = await Player.find().sort({ sacks: -1 }).limit(1);
               break;
            default:
               result = {};
               break;
         }
   
         res.json(result);
       } catch (err) {
         console.error('Error performing query:', err);
         res.status(500).json({ error: 'Internal Server Error' });
      }
      // res.json(queryType);
   })

  // Add players
  app.post('/addPlayer', async (req, res) => {
    const playerData = req.body;
    try {
      const newPlayer = await Player.create(playerData);
      res.json({ message: 'Player added successfully', player: newPlayer });
    } catch (err) {
      console.error('Error adding player:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Update players
  app.put('/updatePlayer/:playerName', async (req, res) => {
    const playerName = req.params.playerName;
    const updatedData = req.body;
    try {
      const result = await Player.updateOne({ name: playerName }, { $set: updatedData });
      res.json({ message: `Player ${playerName} updated successfully`, modifiedCount: result.modifiedCount });
    } catch (err) {
      console.error('Error updating player:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Delete players
  app.delete('/deletePlayer/:playerName', async (req, res) => {
    const playerName = req.params.playerName;
    try {
      const result = await Player.deleteOne({ name: playerName });
      res.json({ message: `Player ${playerName} deleted successfully`, deletedCount: result.deletedCount });
    } catch (err) {
      console.error('Error deleting player:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Perform queries
  app.post('/perform_query', async (req, res) => {
    const queryType = req.body.query_type;

    try {
      let result;

      switch (queryType) {
        case 'most_touchdowns':
          result = await Player.find().sort({ touchdowns: -1 }).limit(1);
          break;
        case 'most_rushing_yards':
          result = await Player.find().sort({ rushing_yards: -1 }).limit(1);
          break;
        // Add more queries as needed...
      }

      res.json(result);
    } catch (err) {
      console.error('Error performing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
