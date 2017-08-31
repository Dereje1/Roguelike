class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      walls:[],//array collects all live cell positions
      holderSize:800,
      elementSize:40,//grid elements per board
      staging:"Loading Map",
      positionsOccupied:{},
      allPoints:{},
      dungeonChange: false,
      modal:false
    }
    this.newGridLoad=this.newGridLoad.bind(this)
    this.gamePlay=this.gamePlay.bind(this)
    this.placeGameObjects=this.placeGameObjects.bind(this)
  }

  componentWillMount(){
    console.log("will mount")
    this.newGridLoad(true)
  }
  componentDidUpdate(){
    $("#elementHolder").scrollTop(this.state.positionsOccupied.yScroll);
    $('#elementHolder').focus();
  }

  newGridLoad(fresh=false){

    console.log("making caves " + this.state.staging)
    let walls = cellAutomata(this.state.elementSize);
    let wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    while (wallPercent>0.5){
      walls = cellAutomata(this.state.elementSize);
      wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    }

    let allOccupiedPositions = this.placeGameObjects(walls);
    let points = this.pointsAssement(fresh)
    console.log(points)
    this.setState({
      walls:walls,
      positionsOccupied:allOccupiedPositions,
      allPoints:points,
      dungeonChange:false,
      staging:"Game Play"
    })
  }

  placeGameObjects(walls){
    let boxSizeArray = Array.apply(null, {length: this.state.elementSize}).map(Number.call, Number)
    let allOccupied=[]
    let positions={}
    let food=[], enemies=[]
    let player="",weapon="",dungeon="",dragon=""

    randomFind()
    function randomFind(){
        if(allOccupied.length===13){return;}
        let y = boxSizeArray[Math.floor(Math.random() * boxSizeArray.length)]
        let x = boxSizeArray[Math.floor(Math.random() * boxSizeArray.length)]
        let stringCoords = y.toString()+"_"+x.toString()
        if(!walls.includes(stringCoords)){
          if(allOccupied.length===0){//trying to center player
          //  if((y<2)||(y>37)){randomFind()}
          }
          if(!allOccupied.includes(stringCoords)){
            allOccupied.push(stringCoords)
          }
        }
        randomFind()
    }

    player = allOccupied.shift();
    let initialScroll = (parseInt(player.split("_")[0],10) * 20)-200;
    if(initialScroll<0){initialScroll=0}
    if(initialScroll>400){initialScroll=400}
    console.log("starting Position "+ player)
    console.log("initialScroll "+ initialScroll)
    $("#elementHolder").scrollTop(initialScroll);
    let copyOccupied = allOccupied.slice();//copy because I want this value also in the state object
    for(let i=0;i<5;i++){food.push(copyOccupied.shift())}
    for(let i=0;i<5;i++){enemies.push(copyOccupied.shift())}
    weapon = copyOccupied.shift()
    if (this.state.allPoints.dungeon===3){
      dragon = copyOccupied.shift()
    }
    else{
      dungeon = copyOccupied.shift()
    }

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
    console.log("Fresh = " + newgame)
    let points={}
    if(newgame){
      points={
        health:100,
        weapon:"Stick",
        attack:7,
        level:1,
        nextLevel:60,
        dungeon:0,
        levelMultiplier:1,
        totalEnemyPower:2500,
        totalDamageInflicted:0
      }
    }
    return points;
  }
  playerMovement(e){
    e.preventDefault()
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
        console.log("Non arrow key press")
    }
    //console.log(newPosition)

    let newPositionString = newPosition[0]+"_"+newPosition[1];
    if(this.state.walls.includes(newPositionString)){
      //console.log("out of bounds")
      return;
    }
    else if(positionsCopy.allPositions.includes(newPositionString)){
      //console.log("out of bounds")
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
    $("#"+positionsCopy.player).css("background-color", "white")

    positionsCopy.player = newPositionString;
    this.setState({
      positionsOccupied:positionsCopy
    })
    $("#"+newPositionString).css("background-color", "blue")
    $("#elementHolder").scrollTop(this.state.positionsOccupied.yScroll);
  }

  gamePlay(positionsObj,newpos){
    let positionKeys = Object.keys(positionsObj)
    let pointsCopy = JSON.parse(JSON.stringify(this.state.allPoints))
    let indexOfAllPositions = positionsObj.allPositions.indexOf(newpos)
    for(let i=0;i<positionKeys.length;i++){
      if(positionKeys[i]==="allPositions"){continue}
      if(positionKeys[i]==="yScroll"){continue}
      if(positionsObj[positionKeys[i]].includes(newpos)){
        console.log("this is a " + positionKeys[i])
        switch (positionKeys[i]) {
          case "food":
            pointsCopy.health+=30
            this.setState({
              allPoints:pointsCopy
            })
            positionsObj.allPositions.splice(indexOfAllPositions,1)
            let indexOfFood = positionsObj.food.indexOf(newpos)
            positionsObj.food.splice(indexOfFood,1)
            this.setNewPosition(positionsObj,newpos)
            break;
          case "weapon":
            pointsCopy.attack = pointsCopy.attack +(pointsCopy.levelMultiplier*7)
            pointsCopy.levelMultiplier++
            if(pointsCopy.levelMultiplier===2){pointsCopy.weapon="Brass Knuckles"}
            else if(pointsCopy.levelMultiplier===3){pointsCopy.weapon="Serrated Dagger"}
            else if(pointsCopy.levelMultiplier===4){pointsCopy.weapon="Katana"}
            else if(pointsCopy.levelMultiplier===5){pointsCopy.weapon="Reaper's Scythe"}
            else{pointsCopy.weapon="Large Trout"}
            this.setState({
              allPoints:pointsCopy
            })
            positionsObj.allPositions.splice(indexOfAllPositions,1)
            positionsObj.weapon=""
            this.setNewPosition(positionsObj,newpos)
            break;
          case "dungeon":
            pointsCopy.dungeon++;
            this.setState({
              allPoints:pointsCopy,
              dungeonChange:true,
              modal:true
            },this.newGridLoad(false))
            return;
          case "enemies":
            let damageInflicted = pointsCopy.attack*(pointsCopy.level/5);
            let damageTaken = (pointsCopy.dungeon*4)+16;
            let enemiesLeft = positionsObj.enemies.length

            //small interpolation prediction based on the end of the dungeon level
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
              this.setState({
                dungeonChange:true
              },this.newGridLoad(true))
            return;}
            this.setState({
              allPoints:pointsCopy
            })
            console.log("totalDamageInflicted " + pointsCopy.totalDamageInflicted)
            console.log("damageNeeded " + damageNeeded)
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
          this.setState({
            dungeonChange:true
          },this.newGridLoad(true))
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
        <PlayerDisplay main={this.state.allPoints} modalDisplay={this.state.modal}/>
        <div key={this.state.dungeonChange} id="elementHolder" tabIndex="0" style={holderStyling} onKeyDown={(e)=>this.playerMovement(e)}>
            <GridMaker
              refresh = {this.state.dungeonChange}
              holderSize ={this.state.holderSize}
              elementSize={this.state.elementSize}
              positions={this.state.positionsOccupied}
              walls = {this.state.walls}
              cellRef={(input) => this.x = input }
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
