(function(window){
    'use strict';

    //Set up the selectizes.
    $('#attackingUnit').selectize({
    });

    $('#defendingUnit').selectize({
    });

    var strike;

    var Die1 = 2;
    var Die2 = 3;
    var Attacker = {
      country:  "prc",
      type:     "naval",
      typeUnit: "CG Type 55",
      move:     4,
      stealth:  2,
      ca:       null,
      g:        2,
      gRange:   0,
      u:        2,
      uRange:   0,
      as:       4,
      asRange:  6,
      ag:       4,
      agRange:  10,
      md:       9,
      amd:      null,
      aa:       null,
      t:        2,
      tRange:   0,
      steps:    3
    };
    var Defender = {
      country:  "prc",
      type:     "naval",
      typeUnit: "CG Type 55",
      move:     4,
      stealth:  2,
      ca:       null,
      g:        2,
      gRange:   0,
      u:        2,
      uRange:   0,
      as:       4,
      asRange:  6,
      ag:       4,
      agRange:  10,
      md:       9,
      amd:      null,
      aa:       null,
      t:        2,
      tRange:   0,
      steps:    3
    };
    var TicksMissing = true;
    var AirDistance = null;
    var CombinedArmsLocation = null;

    combatRouter(Attacker, Defender)


    combatRouter(attacker,defender,defTerrain){
        if (defender.type == "air"){

        }
        else if (defender.type == "ground"){

        }
        else if (defender.type == "surface naval"){
            if (defTerrain == "sea") {
                if (attacker.as != null){
                    $("divWeaponsSystems").show();
                    $("btnAS").show();
                }
            }
            else if (defTerrain == "port") {

            }
        }
        /*else if (defender.type == "submarine"){
            if (defTerrain == "sea") {
                if (attacker.as != null){
                    $("btnAS").show();
                }
            }
            else if (defTerrain == "port") {

            }
        }*/
        else if (defender.type == "fort"){

        }
        else if (defender.type == "airbase"){

        }

    }



    //combatResolution(Die1,Die2,Attacker,Defender,Ticks,AirDistance,CombinedArmsLocation);
    function combatResolution(die1, die2, attacker, defender, ticksMissing, airDistance, combinedArmsLocation){
      strike = die1 + die2;
      if (defender.type == "naval"){
        if (sameHex === true){
          strike = strike + attacker.as;
        }
        else if (sameHex === false){
          strike = strike + attacker.g;
        }
      }
      else if (defender.type ==  "air"){
        strike = strike + attacker.aa;
      }
      else if (defender.type == "land"){
        strike = strike + attacker.ag;
      }
      if (attacker.type == "air"){
      }
      else if (attacker.type == "combined arms"){
      }
    }
})(window);
