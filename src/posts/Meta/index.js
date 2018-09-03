import React, { Component } from 'react';

// we will move these eventually
import TopTenWeapons from '../../graphs/TopTenWeapons';
import Meta from '../../graphs/Meta';
import MetaAverages from '../../graphs/MetaAverage';
import WeaponKillsHistogram from '../../graphs/WeaponKillsHistogram';

class MetaPost extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="container posts">
        <h1>Understanding the Meta</h1>
        <h4><em>A look at how Destiny 2's Crucible meta fluctuates over time.</em></h4>
        <div class="content"> 
          This post is a high-level look at Destiny's meta and how certain weapons have come and gone during its first year.  This post does <strong>not</strong> attempt to predict what the Year 2 meta will look like.  Instead we are going to examine the past year's trend to better understand what Year 2 might look like and why patience is key. 
        </div>
        <h2>Defining Meta</h2>
        <div>
          First, we should start by defining what we mean by "the meta."  You could go to this <a href="https://en.wikipedia.org/wiki/Metagaming">rather interesting Wikipedia article on it</a> and learn something.  In practice, "the meta" almost always equates to "what's popular."  This is because subscribing to the game's "meta" generally results in better performance (real or perceived), which then lends itself to more and more players buying into "the meta."  
        </div>

        <div>
          Since the meta is generally related to "what is popular", we can retroactively measure it.  We've broken the past year into weeks, where each week is a Sunday at 00:00 to Saturday at 23:59 timeframe (ignore the missing second).  We can then calculate the most used weapons in any Crucible playlist during any given week.
        </div>
        <div>
          There are several conditions to being one the most used.  First, by "most" we mean the top ten.  By "used" we are actually measuring the number of times a weapon appears in a game.  So if a weapon has a .5 usage, that means that the weapon had at least 1 kill in 50% of games during that week.  On top of that, in order to filter out some noise, a weapon must have maintained a spot in the top ten for at least 3 weeks.  Using those conditions, we get the resulting graph that measures "the meta."
        </div>
        <TopTenWeapons/>
        <div>
          We think that "game appearances" is a better metric for measuring Destiny's Meta than something like "number of kills" would be.  The reason is that some weapons may be a part of the meta, but may actually constitute a low number of overall kills.  For example, Sins of the Past has been a steady member of the Top Ten, but it's number of kills is actually rather low compared to other weapons likely due to the decreased role that heavy (and secondary) weapons played in Year 1.  
        </div>
        <div>
          There are a few trends that we can observe from this chart.  First, the meta does cycle.  The weapons included in each change over time, as we should expect.  Second, if you double click in on individual weapons, you'll see that most weapons have a growth period.  It is rare for a gun to catapult up to the top of the chart.  There is usually a period at which it breaks through the meta barrier and then continues to grow from there.  Sometimes, that growth is explosive (like Graviton Lance) or much steadier (like Origin Story).
        </div>
        <div>
          The "explosiveness" of growth may be worth a more investigation.  Why do certain weapons explode versus slowly build up?  The current working hypothesis is that explosive growth relates to exploits resulting from bugs or odd balance adjustments made by Bungie.  For example, Prometheus Lens (which isn't showed here) randomly jumps from almost no usage to 42% and then to almost 80% during two weeks where the gun was <span className="strike">overpowered</span> oddly efficient.  After a patch, the weapon quickly disappears from use.  Graviton Lance has a similar growth pattern.  It exists below 10% usage before skyrocketing to 48% in early May and eventually peaking at 91%.
        </div>
        <h2>Unpacking Weapon Usage</h2>
        <div>
          Another question we had while investigating the data was "how often must a gun a appear to be a part of the meta?"  We can examine this by creating a histogram of each week.  Each bucket on our x-axis is a range of usage rates.  The y-axis is the number of weapons that fell into that rate.
        </div>
        <WeaponKillsHistogram/>
        <div>
          What we can see is that the <strong>vast</strong> majority of weapons have less than 5% usage.  The number of weapons that see increased usage continues to diminish.  It may be hard to see on a smaller screen, but on average, there are only ten guns that have a usage rate of 35% or above.  So emperically speaking, a weapon must appear in about 1/3 games for it to become a member of "the meta."
        </div>
        <div>
          There are several factors in play here that we don't necessarily account for.  First, Destiny was 4v4 for a period of time.  So the maximum number of weapons that could appear in a game (assuming every player used a different weapon) in every slot was 24.  Now that most of Crucible is 6v6, the max number is 36.  With more players per game, the likelihood of any gun appearing increases because there are more slots that the weapon could fill.  The other factor is an increase in the number of weapons available.  As more weapons are added, and assuming all things are equal (which if they were, half of the Destiny sub-Reddit wouldn't exist), then the probability of any weapon being chosen would decrease.
        </div>
        <div>
          Again, in general, a weapon must break the 35% usage barrier to gain entry to the meta.  
        </div>
        <h2>Upcoming Changes</h2>
        <div>
         The final questions we wanted to ask were "how long does a weapon stay in meta for?" and slightly related to that, "what is a weapon's lifecycle look like once it is in meta?"

         For this we are going to back out and look just at the top ten weapons (even those that didn't survive 3 weeks) so we can understand the initial part of a weapon's rise to metadom.  We can look at each weapon and count the number of weeks it was in meta and once again create a histogram representing that distribution.
        </div>
        <Meta/>
        <div>
          What we get from this is that only 48% of top ten weapons in any given week survive to metadom.  In other words, 48% of top ten weapons do not survive 3 weeks in the top ten.
        </div>
        <div>
          After that, it's a much more mixed bag.  20% of top ten weapons stay in the top ten for up to 10 weeks (a little over 3 months for the less mathematically inclined).  The rest exist in a state scattered between 10 and 51 weeks.
        </div>
        <div>
          So it is possible for a weapon, despite all of the changes that Bungie has thrown at the game, to maintain its metadom for eternity.  Prime examples of this are Sins of the Past, Origin Story, Uriel's Gift and Better Devils.  All four have been dethroned since the release of Forsaken, so it will be interesting to see what other weapons will fill the void and how long they will stay.  Graviton Lance pushed for a 50+ week run, but it too has fallen off within a few weeks of Forsaken's release.
        </div>
        <div>
          Which leads into our final question, "what does a weapon's lifecycle look like once it acheives metadom?"  We did a rather simple analysis and compared every weapon's usage based on its first, second, or <code>nth</code> week in the top ten.
        </div>
        <MetaAverages/>
        <div>
          What we see is that on average, these weapons experience usage growth in their first 3 weeks and then they make a rather large jump during their fourth and fifth weeks (if they make it that far at all).  As a weapon continues in its lifecycle past five weeks, it's usage remains rather constant.  There is an odd spike at 51 weeks likely because there are so few guns out there, it's hard to get an accurate read.
        </div>
        <div>
          So it will be interesting to see the Forsaken guns that have climbed into the meta.  As we enter the fourth week, Go Figure, Ace of Spaces, and Trust have seen steady climbs.  If Year 1 is any indication, the next few weeks will show us if those guns are here to stay.
        </div>
        <div>
          Or Bungie could throw another curveball at us and unlock a new area which unleashes a whole new wave of guns that renders this entire project useless.
        </div>
      </div>
    );
  }
}

export default MetaPost;
