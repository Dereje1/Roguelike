class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      walls:[],
      holderSize:800,
      elementSize:40,
      lights:false,
      positionsOccupied:{},
      allPoints:{},
      dungeonChange: false,
      modal:[false,""]
    }
    //bindings
    this.newGridLoad=this.newGridLoad.bind(this)
    this.gamePlay=this.gamePlay.bind(this)
    this.placeGameObjects=this.placeGameObjects.bind(this)
    this.continueGame=this.continueGame.bind(this)
    this.toggleLights=this.toggleLights.bind(this)
  }


  componentWillMount(){
    //call grid load with fresh mount
    this.newGridLoad(true)
  }
  componentDidMount(){
    if(!this.state.lights){this.visibilityOff()}
  }
  componentDidUpdate(){
    //on every update
    $("#elementHolder").scrollTop(this.state.positionsOccupied.yScroll);
    $('#elementHolder').focus();
    if(!this.state.lights){this.visibilityOff()}
  }
  toggleLights(){//turns on/off dungeon lights
    if(!this.state.lights){
      this.setState({
        lights:true
      },this.visibilityOn())
    }
    else{
      this.setState({
        lights:false
      },this.visibilityOff())
    }
  }

  newGridLoad(fresh=false){
    //create cave walls
    let walls = cellAutomata(this.state.elementSize);
    let wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    //loop again if too many walls(>50%)
    while (wallPercent>0.5){
      walls = cellAutomata(this.state.elementSize);
      wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    }
    //initiate game objects
    let allOccupiedPositions = this.placeGameObjects(walls);
    //initiate game points
    let points = this.pointsAssement(fresh)
    //set board state
    this.setState({
      walls:walls,
      positionsOccupied:allOccupiedPositions,
      allPoints:points,
      dungeonChange:false,
    })

  }

  continueGame(modalReason){//executed upon cotinue from modal
    let updateType;
    if (modalReason==="Dungeon Up"){
      updateType=false;
    }
    else{
      updateType=true;
    }
    //setting dungeonChange to true updates grid component
    this.setState({
      dungeonChange:true,
      modal:false
    },this.newGridLoad(updateType))
  }

  placeGameObjects(walls){//place objects randomly
      let boxSizeArray = Array.apply(null, {length: this.state.elementSize}).map(Number.call, Number)
      let allOccupied=[]
      let positions={}
      let food=[], enemies=[]
      let player="",weapon="",dungeon="",dragon=""

      randomFind()//recursive function to place objects without hitting walls and other objects
      function randomFind(){
          if(allOccupied.length===13){return;}//13 objects to place per dungeon
          let y = boxSizeArray[Math.floor(Math.random() * boxSizeArray.length)]
          let x = boxSizeArray[Math.floor(Math.random() * boxSizeArray.length)]
          let stringCoords = y.toString()+"_"+x.toString()
          if(!walls.includes(stringCoords)){
            if(!allOccupied.includes(stringCoords)){
              allOccupied.push(stringCoords)
            }
          }
          randomFind()
      }
      //first random object is player
      player = allOccupied.shift();
      //set initial scroll for first display of player
      let initialScroll = (parseInt(player.split("_")[0],10) * 20)-200;
      if(initialScroll<0){initialScroll=0}
      if(initialScroll>400){initialScroll=400}
      $("#elementHolder").scrollTop(initialScroll);//scroll with jquery!

      let copyOccupied = allOccupied.slice();//copy because I want this value to be also stored in the state object
      //next 5 are health
      for(let i=0;i<5;i++){food.push(copyOccupied.shift())}
      //next 5 are enemies
      for(let i=0;i<5;i++){enemies.push(copyOccupied.shift())}
      //next is wa weapon upgrade
      weapon = copyOccupied.shift()
      //depending on dungeon next is dungeon change/ dragon
      if (this.state.allPoints.dungeon===4){
        dragon = copyOccupied.shift()
      }
      else{
        dungeon = copyOccupied.shift()
      }
      //set and return positions object
      positions.player = player;
      positions.food = food;
      positions.enemies = enemies;
      positions.weapon = weapon;
      positions.dungeon = dungeon;
      positions.dragon = dragon;
      positions.allPositions = allOccupied;
      positions.yScroll = initialScroll;
      return positions
  }

  pointsAssement(newgame=false){
    //resets points / just maintains previous points
    let points={}
    if(newgame){
      points={
        health:100,
        weapon:"Fists",
        attack:7,
        level:1,
        nextLevel:60,
        dungeon:0,
        levelMultiplier:1,
        totalEnemyPower:2500,
        totalDamageInflicted:0
      }
    }
    else{
      points=this.state.allPoints
    }
    return points;
  }
  playerMovement(e){
    e.preventDefault()
    //deep copy object and modify
    let positionsCopy = JSON.parse(JSON.stringify(this.state.positionsOccupied))
    let currentPlayerPosition = positionsCopy.player.split("_").map(function(z){
      return parseInt(z,10)
    });

    let newPosition=[]
    //console.log(currentPlayerPosition)
    switch (e.keyCode) {
      case 40:
        //console.log("Player Down")
        newPosition=[currentPlayerPosition[0]+1,currentPlayerPosition[1]]
        positionsCopy.yScroll+=20;
        break;
      case 38:
        //console.log("Player Up")
        newPosition=[currentPlayerPosition[0]-1,currentPlayerPosition[1]]
        positionsCopy.yScroll-=20;
        break;
      case 39:
        //console.log("Player Right")
        newPosition=[currentPlayerPosition[0],currentPlayerPosition[1]+1]
        break;
      case 37:
        //console.log("Player Left")
        newPosition=[currentPlayerPosition[0],currentPlayerPosition[1]-1]
        break;
      default:
        newPosition=currentPlayerPosition
    }
    //console.log(newPosition)

    let newPositionString = newPosition[0]+"_"+newPosition[1];
    if(this.state.walls.includes(newPositionString)){
      //console.log("wall met")
      return;
    }
    else if(positionsCopy.allPositions.includes(newPositionString)){
      //console.log("Game object met")
      this.gamePlay(positionsCopy,newPositionString)
      return;
    }

    else if((newPosition[0]<0)||(newPosition[0]>this.state.elementSize-1)){
      //console.log("out of bounds")
      return;
    }
    else if((newPosition[1]<0)||(newPosition[1]>this.state.elementSize-1)){
      //console.log("out of bounds")
      return;
    }
    else{this.setNewPosition(positionsCopy,newPositionString)}
  }

  setNewPosition(positionsCopy,newPositionString){
    //uses jquery to change css properties of movement cells
    $("#"+positionsCopy.player).css("background-color", "white")

    positionsCopy.player = newPositionString;
    this.setState({
      positionsOccupied:positionsCopy
    })
    $("#"+newPositionString).css("background-color", "blue")
    $("#elementHolder").scrollTop(this.state.positionsOccupied.yScroll);
    //handle visibility if no lights
    if(!this.state.lights){this.visibilityOff()};
  }

  visibilityOff(){
    //handles darkness using jquery to manipulate css for entire grid
    for (let i=0;i<this.state.elementSize;i++){
      for(let j=0;j<this.state.elementSize;j++){
        let cellId = i.toString()+"_"+j.toString();
        let currentPlayerPosition = this.state.positionsOccupied.player.split("_").map(function(z){
          return parseInt(z,10)
        });
        if (i<currentPlayerPosition[0]-3){$("#"+cellId).css("visibility", "hidden")}
        else if (i>currentPlayerPosition[0]+3){$("#"+cellId).css("visibility", "hidden")}
        else if (j<currentPlayerPosition[1]-3){$("#"+cellId).css("visibility", "hidden")}
        else if (j>currentPlayerPosition[1]+3){$("#"+cellId).css("visibility", "hidden")}
        else{$("#"+cellId).css("visibility", "visible")}
      }
    }

  }
  visibilityOn(){
    //runs only once if light switch turned back on
    for (let i=0;i<this.state.elementSize;i++){
      for(let j=0;j<this.state.elementSize;j++){
        let cellId = i.toString()+"_"+j.toString();
        $("#"+cellId).css("visibility", "visible")
      }
    }

  }

  gamePlay(positionsObj,newpos){
    //handles game play points distribution
    let positionKeys = Object.keys(positionsObj)
    let pointsCopy = JSON.parse(JSON.stringify(this.state.allPoints))
    let indexOfAllPositions = positionsObj.allPositions.indexOf(newpos)
    for(let i=0;i<positionKeys.length;i++){
      if(positionKeys[i]==="allPositions"){continue}
      if(positionKeys[i]==="yScroll"){continue}
      if(positionsObj[positionKeys[i]].includes(newpos)){
        switch (positionKeys[i]) {
          case "food"://health object
            pointsCopy.health+=35
            this.setState({
              allPoints:pointsCopy
            })
            positionsObj.allPositions.splice(indexOfAllPositions,1)
            let indexOfFood = positionsObj.food.indexOf(newpos)
            positionsObj.food.splice(indexOfFood,1)
            this.setNewPosition(positionsObj,newpos)
            break;
          case "weapon"://weapon upgrade
            pointsCopy.attack = pointsCopy.attack +(pointsCopy.levelMultiplier*7)
            pointsCopy.levelMultiplier++
            if(pointsCopy.levelMultiplier===2){pointsCopy.weapon="Brass Knuckles"}
            else if(pointsCopy.levelMultiplier===3){pointsCopy.weapon="Nunchuks"}
            else if(pointsCopy.levelMultiplier===4){pointsCopy.weapon="Katana"}
            else if(pointsCopy.levelMultiplier===5){pointsCopy.weapon="Composite Bow"}
            else{pointsCopy.weapon="AK 47"}
            this.setState({
              allPoints:pointsCopy
            })
            positionsObj.allPositions.splice(indexOfAllPositions,1)
            positionsObj.weapon=""
            this.setNewPosition(positionsObj,newpos)
            break;
          case "dungeon"://dungeon up
            pointsCopy.dungeon++;
            $('#elementHolder').empty()
            //calls modal from display component
            this.setState({
              allPoints:pointsCopy,
              modal:[true,"Dungeon Up","Going to Dungeon "+ pointsCopy.dungeon + ", press Continue to Build Map"]
            })
            break;
          case "enemies":
            let damageInflicted = pointsCopy.attack*(pointsCopy.level/5);
            let damageTaken = (pointsCopy.dungeon*4)+16;
            let enemiesLeft = positionsObj.enemies.length
            let dungeonCopy=pointsCopy.dungeon
            //spredict damage
            let predictiveDamage = function(dungeon){
              if(dungeon===0){
                return 14*(1+Math.random());
              }
              if(dungeon===1){
                return 70*(1+Math.random());
              }
              if(dungeon===2){
                return 227*(1+Math.random());
              }
              if(dungeon ===3){
                return 705*(1+Math.random())
              }
              if(dungeon===4){
                return 1734*(1+Math.random())
              }
            }
            let damageNeeded=predictiveDamage(pointsCopy.dungeon)/enemiesLeft
            pointsCopy.totalEnemyPower-=damageInflicted;
            pointsCopy.totalDamageInflicted+=damageInflicted;
            pointsCopy.health-=damageTaken;
            if(pointsCopy.health<0){
              pointsCopy= this.pointsAssement(true)
              $('#elementHolder').empty()
              this.setState({
                allPoints:pointsCopy,
                modal:[true,"Dead","You got killed in dungeon "+ dungeonCopy + ", press Continue to start over"]
              })
            return;}
            this.setState({
              allPoints:pointsCopy
            })
            //only remove enemy if enough total damage has been done
            if (pointsCopy.totalDamageInflicted>damageNeeded){
              pointsCopy.nextLevel-=(pointsCopy.dungeon*20)+10;
              if(pointsCopy.nextLevel<=0){
                pointsCopy.level++;
                pointsCopy.nextLevel = (pointsCopy.dungeon*10)+60
              }
              this.setState({
                allPoints:pointsCopy
              })
              positionsObj.allPositions.splice(indexOfAllPositions,1)
              let indexOfEnemy = positionsObj.enemies.indexOf(newpos)
              positionsObj.enemies.splice(indexOfEnemy,1)
              this.setNewPosition(positionsObj,newpos)
            }
            break;
          case "dragon":
            damageInflicted = pointsCopy.attack*(pointsCopy.level/5);
            damageTaken = (pointsCopy.dungeon*4)+16;
            pointsCopy.totalEnemyPower-=damageInflicted;
            pointsCopy.totalDamageInflicted+=damageInflicted;
            pointsCopy.health-=damageTaken;
            if(pointsCopy.health<0){
              pointsCopy= this.pointsAssement(true)
              $('#elementHolder').empty()
              this.setState({
                allPoints:pointsCopy,
                modal:[true,"Dead","You got killed by the Dragon, press Continue to start over"]
              })
            return;}
            else if(pointsCopy.totalEnemyPower<0){
              pointsCopy= this.pointsAssement(true)
              $('#elementHolder').empty()
              this.setState({
                allPoints:pointsCopy,
                modal:[true,"Win","You Killed the Dragon!, press Continue to start the game over"]
              })
            return;
            }
            else{
              this.setState({
                allPoints:pointsCopy
              })
            }
            break;
          default:

        }
      }
    }
  }

  render(){
    let holderStyling={
      width:this.state.holderSize,
      height: this.state.holderSize/2
    }
    return(
      <div>
        <PlayerDisplay
          main={this.state.allPoints}
          modalDisplay={this.state.modal}
          modalContinue={this.continueGame}
          lightSwitch={this.toggleLights}
          />
        <div key={this.state.dungeonChange} id="elementHolder" tabIndex="0" style={holderStyling} onKeyDown={(e)=>this.playerMovement(e)}>
            <GridMaker
              refresh = {this.state.dungeonChange}
              holderSize ={this.state.holderSize}
              elementSize={this.state.elementSize}
              positions={this.state.positionsOccupied}
              walls = {this.state.walls}
              lights={this.state.lights}
              loadSignalBack={()=>this.setState({dungeonChange:false})}
            >
            </GridMaker>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById("app")
)
