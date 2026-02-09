import { Router } from 'express';
import RaceMatch from '../models/raceMatch';
import Avatar from '../models/avatar';

const router = Router();

// GET /api/race/history/:avatarId
// Fetch last 5 race matches for an avatar
router.get('/history/:avatarId', async (req, res) => {
  try {
    const { avatarId } = req.params;
    
    const matches = await RaceMatch.find({
      players: avatarId
    })
      .populate('players', 'userName')
      .populate('winner', 'userName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Format for frontend
    const formattedMatches = matches.map(match => {
      const player1 = match.players[0] as any;
      const player2 = match.players[1] as any;
      const winner = match.winner as any;
      
      return {
        player1: player1.userName,
        player2: player2.userName,
        winner: winner.userName,
        date: match.createdAt.toISOString().split('T')[0],
      };
    });
    
    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching race history:', error);
    res.status(500).json({ error: 'Failed to fetch race history' });
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
    
    res.json({
      wins: avatar.raceWin,
      losses: avatar.raceLoss,
      totalRaces: avatar.raceWin + avatar.raceLoss,
      winRate: avatar.raceWin + avatar.raceLoss > 0
        ? ((avatar.raceWin / (avatar.raceWin + avatar.raceLoss)) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Error fetching race stats:', error);
    res.status(500).json({ error: 'Failed to fetch race stats' });
  }
});

export default router;

