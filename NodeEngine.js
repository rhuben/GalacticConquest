var rootOfGlobalsInstall = process.env.GLOBALS_HOME;
var rootOfNodeInstall = process.env.nodeRoot;
var globals = require(rootOfNodeInstall+'\\cache');
var pathToGlobalsMGR = rootOfGlobalsInstall + '/mgr';
var assert=require('assert');

/*
 * this is an attempt to create a game similar to battleship,
 * but much larger and in 3 dimensions
 * 
 * this version will make better use of Globals than StarBattleshipOld
 * 
 * I think the game will revolve around planets and spaceships which move
 * as opposed to the static ships in regular battleship
 * 
 * current features:
 * can generate a map with planets
 * can create bases and ships
 * ships can move in a way that is relatively smart
 * can print everything that is interesting
 * map can be arbitrary-dimensional (requires minor changes in the hard-coding)
 * 
 * to see these features, run the program and start reading!
 * 
 * 
 * 
 * features to add:
 * vision (ie determining which things I can or can't see with my units)
 * attacking
 * turn-taking
 * gameplay/winning conditions
 * 
 * 
 * 
 * 
 * 
 */

/*
 * data will be stored as follows:
 * 

 * global: game
 * subscripts:
 * parameters //don't implement this yet
 *      scaleLength=1000
 *      etc
 * POI //POI=point(s) of interest
 *      [0,0,0]
 *          contents=base
 *          alignment=blue
 *      [500,123,456]
 *          contents=planet
 *          alignment=neutral
 * Constants
 *      fighter
 *          speed=100
 *          range=20
 * 
 * 
 * by storing data like this, you take full advantage of globals
 * 
 * all objects in the game are stored as locations first,
 * so positions can be continuous (ie they don't have to be integers)
 * and they only store positions which have things
 * 
 */

 
var scaleLength=1000;
var playerArray=["yellow" ,"red", "blue"]; 
var gameIsOver=false;
startGame();

/*process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.once('data', function (input) {
    console.log("a");
    process.stdin.pause();
}); */



        

//<intializing functions>
function startGame()
{
    console.log("Game started!");
    var board= initializeMap();
    
    addShip(board, [50,0,0],"annihilator", "blue");
    addShip(board, [0,50,0],"fighter", "blue");
    addShip(board, [0,0,50],"fighter", "blue");
    addShip(board, [-50,0,0],"annihilator", "red");
    addShip(board, [0,-50,0],"fighter", "red");
    addShip(board, [0,0,-50],"fighter", "red");
    addShip(board, [0,-50,0],"fighter", "yellow");
    console.log("\n");
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    takeTurn(board, "yellow");
}

function initializeMap() //returns a new map that has been initialized with various things
{
    var board=newEmptyMap();
    board.kill("game");
    
    addConstants(board);
    addPlanets(board);
    addBases(board);
    
    return board;
}

function newEmptyMap() //returns a new empty global
{
    var board=new globals.Cache();
    board.open({
        path: pathToGlobalsMGR,
        username: "userName",
        password: "password",
        namespace: "itDoesntMatter"
    });
    return board;
}

function addConstants(board) //adds constants like the speed and range of ships
{
    //note: these numbers may be WAY off, and should be subject to tweaking
    board.set("game", "constants", "fighter", "speed", 200/1000*scaleLength);
    board.set("game", "constants", "fighter", "sight", 100/1000*scaleLength);
    board.set("game", "constants", "fighter", "range", 40/1000*scaleLength);
    board.set("game", "constants", "fighter", "cost", 10);
    board.set("game", "constants", "fighter", "targets", 
            ["mobile monitor","static monitor","harvester","fighter"].toString());
    
    board.set("game", "constants", "mobile monitor", "speed", 150/1000*scaleLength);
    board.set("game", "constants", "mobile monitor", "sight", 300/1000*scaleLength);
    board.set("game", "constants", "mobile monitor", "range", 0/1000*scaleLength);
    board.set("game", "constants", "mobile monitor", "cost", 0);
    board.set("game", "constants", "mobile monitor", "targets", ["mobile monitor"].toString());

    
    board.set("game", "constants", "static monitor", "speed", 0/1000*scaleLength);
    board.set("game", "constants", "static monitor", "sight", 500/1000*scaleLength);
    board.set("game", "constants", "static monitor", "range", 0/1000*scaleLength);
    board.set("game", "constants", "static monitor", "cost", -1);
    board.set("game", "constants", "static monitor", "targets", [].toString());

    
    board.set("game", "constants", "harvester", "speed", 100/1000*scaleLength);
    board.set("game", "constants", "harvester", "sight", 50/1000*scaleLength);
    board.set("game", "constants", "harvester", "range", 10/1000*scaleLength);
    board.set("game", "constants", "harvester", "cost", 0);
    board.set("game", "constants", "harvester", "targets", ["planet"].toString());

    board.set("game", "constants", "annihilator", "speed", 100/1000*scaleLength);
    board.set("game", "constants", "annihilator", "sight", 100/1000*scaleLength);
    board.set("game", "constants", "annihilator", "range", 100/1000*scaleLength);
    board.set("game", "constants", "annihilator", "cost", 30);
    board.set("game", "constants", "annihilator", "targets", 
            ["mobile monitor","static monitor","harvester","fighter", "planet"].toString());

    
    board.set("game", "constants", "bomb", "speed", 300/1000*scaleLength);
    board.set("game", "constants", "bomb", "sight", 10/1000*scaleLength);
    board.set("game", "constants", "bomb", "range", 10/1000*scaleLength);
    board.set("game", "constants", "bomb", "cost", 50);
    board.set("game", "constants", "bomb", "targets", 
            ["mobile monitor","static monitor","harvester","fighter", "annihilator"].toString());

    
    board.set("game", "constants", "base", "speed", 0/1000*scaleLength);
    board.set("game", "constants", "base", "sight", 200/1000*scaleLength);
    board.set("game", "constants", "base", "range", 0/1000*scaleLength);
    board.set("game", "constants", "base", "cost", -1);
    board.set("game", "constants", "base", "targets", [].toString());

}

function addPlanets(board) //adds planets to a board
{
/*  for (var i=0;i<5;i++)
    {
        addPlanet(board);
    } */
    addPlanet(board, [0,0,0]);
}

function addPlanet(board, position)
{
    /*
     * adds a planet at position if position is defined
     * or at a random location otherwise
     * the random location may need adjusting for balance
     */
    if (position==undefined)
    {
        var randomXPosition=(Math.random()-.5)*1000/1000*scaleLength;
        var randomYPosition=(Math.random()-.5)*1000/1000*scaleLength;
        var randomZPosition=(Math.random()-.5)*1000/1000*scaleLength;
        board.set({
            global: "game",
            subscripts: ["POI", [randomXPosition, randomYPosition, randomZPosition], "contents"],
            data: "planet"
        });
        board.set({
            global: "game",
            subscripts: ["POI", [randomXPosition, randomYPosition, randomZPosition], "alignment"],
            data: "neutral"
        });
    }
    else
    {
        board.set({
            global: "game",
            subscripts: ["POI", position, "contents"],
            data: "planet"
        });
        board.set({
            global: "game",
            subscripts: ["POI", position, "alignment"],
            data: "neutral"
        });
    }
}

function addBases(board) //adds data for the bases of each player
{
    //bases are put on the x-axis
    for (var i=0;i<playerArray.length;i++)
    {
        var a=Math.random();
        board.set({
            global:"game",
            subscripts: ["POI", [a*scaleLength,0,0], "contents"],
            data: "base"
        });
        board.set({
            global:"game",
            subscripts: ["POI", [a*scaleLength,0,0], "alignment"],
            data: playerArray[i]
        });
    }
}
//</intializing functions>



//<printing>
function printAllPOIs(board) //prints the location and some info for each POI
{
    var POIs=listPOI(board);
    printPOIList(board, POIs);
}

function printPOIList(board, list) //prints info about the POIs on the list
{
    var s;
    for (var i=0;i<list.length;i++)
    {
        var thisPlace=list[i];
        s="There is a ";
        s+=board.get({
            global:"game",
            subscripts: ["POI", thisPlace, "alignment"]
        }).data+" ";
        s+=board.get({
            global:"game",
            subscripts: ["POI", thisPlace, "contents"]
        }).data;
        s+=" at the location ";
        s+= toCoordinate(thisPlace);
        s+=".";
        console.log(s);
    }
}

function trim(input) 
/*
 * prepares the input for printing
 * rounds a number to two decimal places
 * also handles arrays
 * strings
 * and arrays that have become strings
 */
{
    if (typeof(input)=="number")
        {return (Math.round(input*100)/100);}
    if(input instanceof Array)
    {
        var returnable=[];
        for (var i=0;i<input.length;i++)
        {
            returnable[i]=trim(input[i]);
        }
        return returnable;
    }
    if(typeof(input)=="string")
        {
        if (input.indexOf(",")==-1) //if input does not contain a comma
            {return trim (Number(input));}
        else //ie if it was secretly an array
            {return trim(input.split(","));}
        }
    assert.ok(false, "Trim() needs to be given a number, a string, or an array!");
}

function toCoordinate(position) //takes an array and returns a nice-looking string of the coordinates
{
    if (typeof(position)=="string")
    {
        return toCoordinate(position.split(","));
    }
    else
    {
        assert.ok(position instanceof Array, "toCoordinate() must be called on an array!");
        var returnable="(";
        for (var i=0;i<position.length;i++)
        {
            if (i!=0)
            {
                returnable+=", ";
            }
            returnable+=trim(position[i]); //note that toCoordinate is pre-trimmed
        }
        returnable+=")";
        return returnable;
    }
}

function printVisible(board, player)
//prints all POIs for which the alignment does not equal the player and the POI is visible
{
    var visiblePOIs=listVisible(board, player);
    console.log("The following things are visible to the "+ player+ " player:");
    printPOIList(board, visiblePOIs);
}

function printOwned(board, player)
//prints all POIs for which the alignment equals player
{
    var ownedPOIs=listOwned(board, player);
    console.log("The following things are owned by the "+ player+ " player: ");
    printPOIList(board, ownedPOIs);
}
//</printing>



//<listing>
function listPOI(board) //returns an array of the coordinates of each POI
//note that when returned, they have been parsed into an array, despite being gotten as a string
{
    var ref="";
    var returnable=[];
    ref=board.order({
        global: "game",
        subscripts: ["POI", ref]
    }).result;
    while (ref!="")
    {
        returnable.push(ref.split(","));
        ref=board.order({
            global: "game",
            subscripts: ["POI", ref]
        }).result;
    }
    return returnable;
}

function listClosePOI(board, position, maxDistance) //returns an array of all POIs within maxDistance of position
{
    assert.ok(maxDistance>=0, "The max distance must be non-negative");
    var POIArray=listPOI(board);
    var returnable=[]; 
    for (var i=0; i<POIArray.length; i++)
    {
        var distance=computeDistance(position, POIArray[i]);
        if (distance<=maxDistance)
        {
            returnable.push ([POIArray[i], distance]);
        }
    }
    return returnable;//returnable with be a 2D array with positions in the first space
       //and distances in the second
}

function listVisible(board, player) //lists all POI that are visible to player
{
    var POIs=listPOI(board); //start with each POI
    var visiblePOIs=[];
    for (var i=0;i<POIs.length;i++)
    {
        var notOwned= board.get({
            global: "game",
            subscripts: ["POI", POIs[i], "alignment"]
        }).data!=player; //if POI "i" is not owned by the player
        if (notOwned)
        {
            var visible=false;
            for (var j=0;j<POIs.length;j++) //for each POI "j"
            {
                if (!visible&&j!=i) //if i is not already seen
                {
                    var owned= board.get({
                        global: "game",
                        subscripts: ["POI", POIs[j], "alignment"]
                    }).data==player;
                    if (owned) //and j is owned by the player
                    {
                        var type= board.get({
                                global: "game",
                        subscripts: ["POI", POIs[j], "contents"]
                        }).data;
                        var sightRange=board.get({
                            global: "game",
                            subscripts: ["constants", type, "sight"]
                        }).data;
                        if (computeDistance(POIs[i], POIs[j])<=sightRange) //and i is within j's sight range
                        {
                            visible=true; //then it is seen
                        }
                    }
                }
            }
            if (visible)
                {visiblePOIs.push(POIs[i]);}
        }
    }
    return visiblePOIs; //visiblePOIs is a 1D array
}

function listOwned(board, player)
{
    var POIs=listPOI(board); //start with each POI
    var ownedPOIs=[];
    for (var i=0;i<POIs.length;i++)
    {
        if (board.get({
            global: "game",
            subscripts: ["POI", POIs[i], "alignment"]
        }).data==player)
        {
            ownedPOIs.push(POIs[i]);
        }
    }
    return ownedPOIs; //owned POIs is a 1D array
}

function listValidTargets(board, agentPosition) //returns a list of all POI which are within range
//and are the appropriate type
{
    var agentType=board.get({
        global: "game",
        subscripts: ["POI", agentPosition, "contents"]
    }).data;
    var agentRange=board.get({
        global: "game",
        subscripts: ["constants", agentType,"range"]
    }).data;
    var targetList=board.get({
        global: "game",
        subscripts: ["constants", agentType, "targets"]
    }).data.split(",");
    var POIs=listClosePOI(board, agentPosition, agentRange); //start with each POI
    var validTargets=[];
    for (var i=0;i<POIs.length;i++)
    {
        POIContents=board.get({
            global: "game",
            subscripts: ["POI", POIs[i] [0], "contents"]
        }).data;
        for (var j=0;j<targetList.length;j++)
        {
            if (targetList[j]==POIContents)
            {
                validTargets.push(toNumberArray(POIs[i] [0])); //returns just positions
            }
        }
    }
    return validTargets; //validTargets is a 1D Array
}
//</listing>



//<position related>
function epsilonPerturb(position)  //changes position slightly in a random way
{
    var randomDirection=Math.floor(position.length*Math.random());
    position[randomDirection]+=2*(Math.random()-.5)*(scaleLength/10000);
    return position;
}

function computeDistance(position1, position2) //computes the distance between the two n-tuples
{
    assert.equal(position1.length, position2.length, "The positions must both be n-tuples for the same n!");
    var distanceSquared=0;
    for (var i=0;i<position1.length;i++)
    {
        var deltaICoord=position1[i]-position2[i];
        distanceSquared+=deltaICoord*deltaICoord;
    }
    return Math.sqrt(distanceSquared);
}

function toNumberArray(input) //parses input into an array of numbers
{
    if (typeof input=="string")
    {
        input=input.split(",");
    }
    for (var i=0;i<input.length;i++)
    {
        input[i]=Number(input[i]);
    }
    return input;
}

function parseCoordinateInput(input, desiredLength) //takes the string input and returns an array desiredLength long 
//parseCoordinateInput ignores all characters besides -0123456789.,
{
    assert.equal(typeof input, "string", "parseCoordinateInput() must take strings!");
    var returnable=[];
    var s="";
    var numberCharacters="-0123456789.";
    for (var i=0;i<input.length;i++)
    {
        var a=input.charAt(i);
        if (numberCharacters.indexOf(a) !=-1) //ie it is a character that should be in a number
        {
            s+=a;
        }
        if (a==","||i+1==input.length)
        {
            returnable.push(Number(s));
            s="";
        }
    }
    for (var i=0;i<desiredLength;i++)
    {
        returnable.push(0);
    }
    return returnable.slice(0, desiredLength); 
}
//</position related>

//<gameplay mechanisms>
    //<movement related>
function move(board, currentPosition, desiredPosition) //moves the ship from currentPosition towards desiredPosition
//returns the new position
{
    currentPosition=toNumberArray(currentPosition);
    desiredPosition=toNumberArray(desiredPosition);
    if (arrayEquals(currentPosition, desiredPosition))
    {
        console.log("The ship at "+ toCoordinate(currentPosition)+ " tried to move to its own space.");
        return currentPosition;
    }
    var type=board.get({
        global: "game",
        subscripts: ["POI", currentPosition, "contents"]
    }).data;
    assert.notEqual(type, "", "There must be something at this position in order to move it!");
    assert.notEqual(type, "planet", "You can't move a planet!");
    
    var distanceLimit=Number(board.get({
        global: "game",
        subscripts: ["constants", type, "speed"]
    }).data);
    if (distanceLimit==0)
    {
        console.log("The ship at " +toCoordinate(currentPosition)+ " moved 0 units");
        return currentPosition;
    }
    var validDestination=computeDestination(currentPosition, desiredPosition, distanceLimit);

    //epsilon perturb validDestination until it gets to an empty space:
    var currentContents=board.get({
        global: "game",
        subscripts: ["POI", validDestination, "contents"]
    }).data;
    while (currentContents!="")
    {
        currentContents=board.get({
            global: "game",
            subscripts: ["POI", validDestination, "contents"]
        }).data;
        validDestination=epsilonPerturb(validDestination);
    }
    //actually set the data:
    board.merge({
        to: {global: "game",
            subscripts: ["POI", validDestination]},
        from: {global: "game",
            subscripts: ["POI", currentPosition]},
    });
    board.kill({
        global:"game",
        subscripts:["POI", currentPosition]
    });
    console.log("Ship moved from "+ toCoordinate(currentPosition)+ " to "+ toCoordinate(validDestination)); 
    return validDestination;
}

function computeDestination(currentPosition, desiredPosition, maxRange)
/*
 * takes ordered n-tuples and a positive number maxRange
 * and tells you where you end up if you try to go up to desiredPosition
 * but not more than maxRange
 */
{
    if (maxRange==0) return currentPosition;
    assert.ok(maxRange>0, "You can't have a destination if you are travelling a negative distance!");
    assert.equal(currentPosition.length, desiredPosition.length, "The positions must be n-tuples for the same n! \n"+toCoordinate(currentPosition)+ " "+ toCoordinate(desiredPosition));
    var distanceToTravel=computeDistance(currentPosition, desiredPosition);
    if (distanceToTravel<=maxRange)
    {
        return desiredPosition;
    }
    else
    {
        var directionVector=[];
        var finalPosition=[];
        for (var i=0;i<currentPosition.length;i++)
        {
            directionVector[i]=(desiredPosition[i]-currentPosition[i])/distanceToTravel; //unit vector in the direction you want to go
            finalPosition[i]=currentPosition[i]+maxRange*directionVector[i]; //vector math! Wheeeee!
        }
        return finalPosition;
    }
}
    //</movement related>
//</gameplay mechanisms>




//<miscellaneous>
function finishGame(board) //clears the board and closes the database
{
    board.kill("game");
    board.close();
    process.exit();
}

function addShip(board, position, type, alignment) //creates a ship
{
    //ensure that position is empty, and slightly change it if it is not
    var currentContents=" ";
    while (currentContents!="")
    {
        currentContents=board.get({
            global: "game",
            subscripts: ["POI", position, "contents"]
        }).data;
        if (currentContents!="")
        {
            position=epsilonPerturb(position);
        }
    }
    //actually add the ship data:
    board.set({
        global: "game",
        subscripts: ["POI", position, "contents"],
        data: type
    });
    board.set({
        global: "game",
        subscripts: ["POI", position, "alignment"],
        data: alignment
    });
    console.log("Finished adding a ship!");
}

function arrayEquals(a, b) //checks if a and b are both arrays and are equal
{
    if (!a instanceof Array) return false;
    if (!b instanceof Array) return false;
    if (a.length!=b.length) return false;
    for (var i=0;i<a.length;i++)
    {
        if (a[i]!=b[i]) return false;
    }   
    return true;
}

function otherPlayer(player) //returns the name of the other player
{
    for (var i=0;i<playerArray.length-1;i++)
    {
        if (playerArray[i]==player)
        {
            return playerArray[i+1];
        }
    }
    return playerArray[0];
}

function cheapClearScreen() //makes the screen go blank
{
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
    
}
//</miscellaneous>

//<turns and phases>
function takeTurn(board, player) //takes a turn for a player
{
    cheapClearScreen();
    console.log("Press enter to begin the "+ player + " player's turn");
    process.stdin.once('data', function (input){
        cheapClearScreen();
        console.log("It is now the "+ player + " player's turn.");
        console.log("He/she sees: \n");
        printOwned(board, player);
        console.log();
        printVisible(board, player);
        
        console.log("Press enter to begin your move phase.");
        
    
        process.stdin.once('data', function (input) 
            {
            movePhase(board, player);
            });
    });
}

function movePhase(board, player) //does the move phase of a player
{
    cheapClearScreen();
    var ownedShips=listOwned(board, player);
    console.log("You have the following " + ownedShips.length +" ships available to you:");
    var ownedShips=listOwned(board, player);
    for (var i=0;i<ownedShips.length;i++)
    {
        var s=i+") A ";
        s+=board.get({
            global:"game",
            subscripts: ["POI", ownedShips[i], "contents"]
        }).data;
        s+=" at the location ";
        s+= toCoordinate(ownedShips[i]);
        s+=".";
        console.log(s);
    }
    process.stdout.write("\nSelect which ship to move or type 'end' to quit: ");
    process.stdin.once('data', function (input) 
        {
            input=input.toString().trim();
            if (input=="end") gameIsOver=true;
            if (gameIsOver) finishGame(board);
            else
            {
                var ownedShips=listOwned(board, player);
                input=Math.floor(Number(input))%listOwned.length;
                process.stdout.write("\nSelect position to move to: ");
                process.stdin.once('data', function (position) {
                    position=position.toString().trim();
                    position=parseCoordinateInput(position, 3);
                    newPosition=move (board, toNumberArray(ownedShips[input]), position);
                    actionPhase(board, newPosition);
                });
            }
        });
}

function actionPhase(board, position) //initiates the phase in which you take an action
//currently only does attacks, not other actions
{
    //first list the targets:
    var player= board.get({
        global:"game",
        subscripts: ["POI", position, "alignment"]
    }).data;
    var agentType= board.get({
            global:"game",
            subscripts: ["POI", position, "contents"]
        }).data;
    var validTargets=listValidTargets(board, position);
    console.log("\nThe "+ player+ " "+ agentType+" at "+
            toCoordinate(position)+ " can target the following objects:");
    for (var i=0;i<validTargets.length;i++)
    {
        s=i+ ") A ";
        s+=board.get({
            global: "game",
            subscripts: ["POI", validTargets[i], "alignment"]
        }).data + " ";
        s+=board.get({
            global: "game",
            subscripts: ["POI", validTargets[i], "contents"]
        }).data + " ";
        s+= "at position "+ toCoordinate(validTargets[i]);
        console.log(s);
    }
    console.log(validTargets.length+ ") No target");
    //then let the player choose the target:
    process.stdin.once('data', function(target)
        {
            target=target.toString().trim();
            target=Math.floor(Number(target))%(validTargets.length+1);
            if (target<0) target+=validTargets.length;
            if (target==validTargets.length) //either dont kill things
            {
                console.log("The ship does not attack anything.");
            }
            else //or do kill things!
            {
                "The ship attacks the ship at "+toCoordinate(validTargets[target]);
                attackAction(board, validTargets[target]);
            }
            //then start the next turn
            console.log("\nPress enter to let the other player's turn start.");
            process.stdin.once('data', function(input)
                {
                takeTurn(board, otherPlayer(player));
            });
    });
}
//</turns and phases>



//<actions>
function attackAction (board, targetPosition) //carries out an attack with appropriate message
{
    var s="The ";
    s+=board.get({
        global: "game",
        subscripts: ["POI", targetPosition, "alignment"]
    }).data+ " ";
    s+=board.get({
        global: "game",
        subscripts: ["POI", targetPosition, "contents"]
    }).data;
        
    s+= " at "+ toCoordinate(targetPosition)+ " was destroyed!";
    board.kill({
        global:"game",
        subscripts: ["POI", targetPosition]
    });
    console.log(s);
}
//</actions>


