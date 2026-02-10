import { Router } from 'express';
import RaceMatch from '../db/raceMatch';  // Adjust path to match your structure
import Avatar from '../db/avatar';        // Adjust path to match your structure

const router = Router();

// GET /api/race/avatar/:avatarId
// Get avatar info (for getting username)
router.get('/avatar/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params;
    
    const avatar = await Avatar.findById(avatarId).select('userName');
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    return res.json({
      _id: avatar._id,
      userName: avatar.userName
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return res.status(500).json({ error: 'Failed to fetch avatar' });
  }
});

// GET /api/race/history/:avatarId
// Fetch last 5 race matches for an avatar
router.get('/history/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params;
    // console.log("=== FETCHING RACE HISTORY ===");
    // console.log("Avatar ID:", avatarId);
    
    const matches = await RaceMatch.find({
      players: avatarId
    })
      .populate('players', 'userName')
      .populate('winner', 'userName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // console.log("Matches found:", matches.length);
    
    // Format for frontend - ensure player order matches database
    const formattedMatches = matches.map(match => {
      const players = match.players as any[];
      const winner = match.winner as any;
      
      // Get player names in the order they appear in the database
      const player1Name = players[0]?.userName || 'Unknown';
      const player2Name = players[1]?.userName || 'Unknown';
      
      // console.log("Match:", player1Name, "vs", player2Name, "- Winner:", winner.userName);
      
      return {
        _id: match._id.toString(),
        player1: player1Name,
        player2: player2Name,
        winner: winner.userName,
        date: match.createdAt.toISOString().split('T')[0],
      };
    });
    
    // console.log("Sending", formattedMatches.length, "formatted matches");
    return res.json(formattedMatches);
  } catch (error) {
    console.error('❌ Error fetching race history:', error);
    return res.status(500).json({ error: 'Failed to fetch race history' });
  }
});

// GET /api/race/stats/:avatarId
// Get race statistics for an avatar
router.get('/stats/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params;
    
    const avatar = await Avatar.findById(avatarId);
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    
    return res.json({
      wins: avatar.raceWin,
      losses: avatar.raceLoss,
      totalRaces: avatar.raceWin + avatar.raceLoss,
      winRate: avatar.raceWin + avatar.raceLoss > 0
        ? ((avatar.raceWin / (avatar.raceWin + avatar.raceLoss)) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Error fetching race stats:', error);
    return res.status(500).json({ error: 'Failed to fetch race stats' });
  }
});

export default router;

