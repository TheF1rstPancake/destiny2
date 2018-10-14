import React, { Component } from 'react';
import GambitFireteamHistogram from '../../graphs/GambitFireteamHistogram';
import GambitFireteamWinRate from '../../graphs/GambitFireteamWinRate';
import GambitFireteamQuitRate from '../../graphs/GambitQuitRate';
import GambitQuitVictories from '../../graphs/GambitQuitVictories';
import GambitFireteamVsFireteamHistogram from '../../graphs/GambitFireteamVsFireteamHistogram';
import GambitFireteamVsFireteam from '../../graphs/GambitFireteamVsFireteam';
class GambitFireteamsPost extends Component {
  constructor(props) {
    super(props);
    this.state = {};

  }
  render() {
    return <div className="container posts">
      <h1>You can't win Gambit without a fireteam, friend. Verify.</h1>
      <h4><em>A look at how playing with a full fireteam impacts performance in Gambit.</em></h4>

      <div className="content">
          Several weeks ago there was a <a href="https://www.reddit.com/r/DestinyTheGame/comments/9h7tkj/you_can_win_gambit_without_a_fireteam_friend_trust/?utm_content=title&utm_medium=user&utm_source=reddit">Reddit post that attempted to convince people that you can compete in Gambit as a solo-player and you even have a chance of winning</a>.  While it is true that you always have a <em>chance</em> of winning in any game that you play, the reality of what your chances are may be rather glum.
        </div>
        <div>
          This post takes a look at Gambit matches since the gamemode's release and analyzes the different fireteam combinations a team can have, and the probability of victory based on your combination.
        </div>
        <h2>Fireteam Composition</h2>
        <div>
          There are five different fireteam combinations that make up a four man team.  You can be a team of all solo players ([1,1,1,1]), two solo players with a pair ([1,1,2]), two pairs ([2,2]), a solo and a triplet ([1,3]) and a full fireteam ([4]).

          We can breakdown how often each composition appears in Gambit by crafting a simple histogram.
        </div>
        <GambitFireteamHistogram/>
        <div>
          Over 60% of games have at least one team of all solo players.  So it is incredibly common to either join a team of solo players or play against a full team of solo players.  Interestingly, teams of pairs are the rarest to find.
        </div>
        <div>
          So there are plenty of players jumping into Gambit solo and being teamed up with other solo players.  One question that we can follow up with is "how often do those solo player teams actually win?"
        </div>
        <GambitFireteamWinRate/>
        <div>
          The answer should be unsurprising.  Solo players teams tend to win 50% of their matches.  Now this graph is slightly skewed.  If a team of solo players goes up against another team of solo players, who wins?  Well, one of the teams with solo players.  So anytime two teams of the same fireteam composition go against eachother, we count that as a win.
        </div>
        <div>
          We will break this out further later.  For now, it is sufficient to say that solo teams win 50% of their matches.  As you move up the ladder into teams that have pairs, triplets you see an upward trend in win rate, which aligns with our expectation that your ability to win increases as you add more players to your fireteam.
        </div>      
        <h2>Quitters Ruin Everything</h2>
        <div>
          There is an assumption that Bungie's matchmaking should create fair matches.  No one wants to join a game that they have almost no chance of winning.  Most people feel from experience that as a team of solos, they have very little chance of defeating a full-fledged fireteam.  We then reach the conclusion that Bungie should not pair solos against full fireteams.
        </div>
        <div>
          This attitude leads to quitting.  If I don't feel like I have a chance to win, why stay?  Especially in Gambit where games are a larger investment.  I can count this mismatch as a fluke and move on.  
        </div>
        <div>
          We can see this by looking at how many players quit against each fireteam composition. This chart measures the amount of times the fireteam composition is <em>quit against.</em>  For example, 15% of games where there is a [1,1,1,1] fireteam, at least one person on the <em>other team</em> will quit.
        </div>
        <GambitFireteamQuitRate/>
        <div>
          The quit rate isn't any better or worse depending on the fireteam composition.  In general, people quit with equal frequency.  The deviation between the teams isn't enough to be relevant.  So people quit in equal measure regardless of what type of team they are up against.
        </div>
        <div>
          During this analysis we also decided to examine what effect quiting has to the probability that a given team will win.  Looking at these matches we can calculate the win rate of a fireteam when an opposing member quits.
        </div>
        <GambitQuitVictories/>
        <div>
          What this shows us quite clearly is that having an opposing team member quit boosts your probability of victory by almost 30% across the board.
        </div>
        <div>
          So quitting generally ruins the experience for everyone. If you quit a game, know you are likely dooming your teammates to a sad defeat.  This is likely why Bungie has recently implemented harsher penalties on people who quit Gambit matches.  
        </div>
        <h2>When you Might Want to Quit</h2>
        <div>
          So far, these numbers have all been aggregates based on fireteam composition.  We were working off the assumption that Bungie generally tries to match similar fireteams together.  But we can take a closer look to figure out just how true that assumption is.
        </div>
        <div>
          So while quitting generally ensures your opponent will win, another questions we should be asking is "did you even have a chance to win the game in the first place?"
        </div>
        <div>
          To do this, we can look only at games where there were <strong>no</strong> quitters and see with what frequency Bungie matchmakes different fireteam compositions against eachother.  If we assume that teams of solos do not have a chance of winning against a full fireteam, then we should see that Bungie's matchmaking does not pair these two types of teams against eachother.
        </div>
        <GambitFireteamVsFireteamHistogram/>
        <div>
          What we see is that Bungie's matchmaking may not follow our assumption.  There are a lot of factors that could go into matchmaking (for example, network compatability) that can compete with creating a fair and balanced match.  We can see the result of this in the fact that 8% of all Gambit games are actually solo teams competing against full fireteams.  Another 9% is two solos and a pair going up against a full fireteam.  Just taking these two numbers into account, at least 17% of all Gambit matches don't involve an equitable distribution of fireteams.
        </div>
        <div>
          To Bungie's credit, 31% of games involve solo teams or a full solo team against two solos and a pair.
        </div>
        <div>
          To measure the impact of disproportionate fireteam composition, we can examine the win rate of these pairings.  We always check if the first team in our pairing won.  For example, in examining [1,1,1,1] vs [4] you should read the chart as "the probability that a team of solos wins against a full fireteam."
        </div>
        <GambitFireteamVsFireteam/>
        <div>
          While solo teams make up a signficant aspect of the population, they really don't win against other team compositions very often.  As a team of solos, your chance of winning against a full fireteam is <strong>39%</strong>.  Not abysmal, but signficantly different than 50%.
        </div>
        <div>
          Again, this is ignoring the effects of quitting.  For teams of [1,1,1,1] that choose to stick out their match against a full squad, they historically do not win very often.
        </div>
        <div>
          Generally speaking, the team that has the largest fireteam has a higher chance of winning.  So if you see yourself in a match where you don't have the largest fireteam, then the odds are not in your favor.
        </div>
        <h2>Conclusion</h2>
        <div>
          We've covered a lot in here.  The majority of Gambit matches have at least one team that is compromised of solo users.  In general, your chances of winning increase as you add people to your fireteam.  
        </div>
        <div>
          Players quit with more or less equal frequency regardless of the type of fireteam they are competing against.  Quitting general means you are handing the other team an easy victory.
        </div>
        <div>
          However, even when we look at games where no one quits, the chance of winning against a team that has the larger fireteam is below 50%.  So while you certainly <em>can</em> win in these situations, some people might decide they are better off not trying at all.
        </div>
    </div>;
  }
}

export default GambitFireteamsPost;