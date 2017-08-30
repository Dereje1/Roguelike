class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      walls:[],//array collects all live cell positions
      holderSize:800,
      elementSize:40,//grid elements per board

      positionsOccupied:{},
      allPoints:{},
      dungeonChange: false
    }
    this.newGridLoad=this.newGridLoad.bind(this)
    this.gamePlay=this.gamePlay.bind(this)
    this.placeGameObjects=this.placeGameObjects.bind(this)
  }

  componentWillMount(){
    console.log("will mount")
    this.newGridLoad(true)
  }
  newGridLoad(fresh=false){
    console.log("making caves")
    let walls = cellAutomata(this.state.elementSize);
    let wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    while (wallPercent>0.5){
      walls = cellAutomata(this.state.elementSize);
      wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    }
    console.log("finished caves")
    let allOccupiedPositions = this.placeGameObjects(walls);
    let points = this.pointsAssement(fresh)
    console.log("Points =" + points)
    this.setState({
      walls:walls,
      positionsOccupied:allOccupiedPositions,
      allPoints:points,
      dungeonChange:false
    })
  }

  placeGameObjects(walls){
    let boxSizeArray = Array.apply(null, {length: this.state.elementSize}).map(Number.call, Number)
    let allOccupied=[]
    let positions={}
    let food=[], enemies=[]
    let player="",weapon="",dungeon=""

    randomFind()
    function randomFind(){
        if(allOccupied.length===13){return;}
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

    player = allOccupied.shift();
    let initialScroll = parseInt(player.split("_")[0],10) * 15;
    if(initialScroll>(this.state.holderSize/2)){initialScroll=this.state.holderSize/2}
    if(initialScroll<40){initialScroll=40}
    console.log("starting Position "+ player)
    console.log("initialScroll "+ initialScroll)
    $("#elementHolder").scrollTop(initialScroll);
    let copyOccupied = allOccupied.slice();//copy because I want this value also in the state object
    for(let i=0;i<5;i++){food.push(copyOccupied.shift())}
    for(let i=0;i<5;i++){enemies.push(copyOccupied.shift())}
    weapon = copyOccupied.shift()
    dungeon = copyOccupied.shift()


    positions.player = player;
    positions.food = food;
    positions.enemies = enemies;
    positions.weapon = weapon;
    positions.dungeon = dungeon;
    positions.allPositions = allOccupied;
    positions.yScroll = initialScroll;
    return positions
  }
  pointsAssement(newgame=false){
    let points={}
    if(newgame){
      points={
        health:100,
        weapon:"Stick",
        attack:7,
        level:0,
        nextLevel:60,
        dungeon:0,
        levelMultiplier:1
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
    let yScrollCopy = this.state.yScroll
    console.log(currentPlayerPosition)
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
    else{this.setNewPosition(positionsCopy,newPositionString,yScrollCopy)}
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
            pointsCopy.health+=20
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
            this.setNewPosition(positionsObj,newpos)
            break;
          case "dungeon":
            pointsCopy.dungeon++;
            this.setState({
              wall:[],
              allPoints:pointsCopy,
              dungeonChange:true
            },this.newGridLoad())
            break;
          default:

        }
      }
    }
  }
  visibleArea(oldposition,newPosition){
      let yDifferential = newPosition[0]-oldposition[0]
      let playerPosition = $("#"+newPosition[0]+"_"+newPosition[1]).position();
      if(!playerPosition){return}//out of bounds jquery returns undefined
      console.log("Div Holder Position ")
      console.log($("#elementHolder").position())
      console.log("player Position ")
      console.log(playerPosition)
      if(yDifferential!==0){
        $("#elementHolder").scrollTop(this.state.yScroll);
      }
  }

  render(){
    let holderStyling={
      width:this.state.holderSize,
      height: this.state.holderSize/2
    }
    return(
      <div>
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

class GridMaker extends React.Component{
  constructor(props){
    super(props)
  }
  componentDidMount(){
    this.props.loadSignalBack()
  }
  componentDidUpdate(){
    this.props.loadSignalBack()
  }
  shouldComponentUpdate(props,nextProps){
    if(this.props.refresh){return true;}
    else{return false;}
  }
  elementbuilder(){
    //builds all cells
    console.log("rendering all Grid Elements")
    let x=[],bcol;
    //find element width
    let elementWidth = (this.props.holderSize/this.props.elementSize).toString()+"px"
    for (let i=0;i<this.props.elementSize;i++){
      for(let j=0;j<this.props.elementSize;j++){
          //construct id string cell coords
          let idConstruct = i.toString()+"_"+j.toString();
          //set color of cell if alive
          if(this.props.walls.includes(idConstruct)){bcol="grey"}
          else if(idConstruct===this.props.positions.player){bcol="blue"}
          else if(idConstruct===this.props.positions.weapon){bcol="orange"}
          else if(idConstruct===this.props.positions.dungeon){bcol="purple"}
          else if(this.props.positions.food.includes(idConstruct)){bcol="green"}
          else if(this.props.positions.enemies.includes(idConstruct)){bcol="red"}
          else{bcol="white"}
          //construct jsx and push
          let stylingDef = {background: bcol,
                            width:elementWidth,
                            height:elementWidth,
                            }
          x.push(   <Cell
                     id={idConstruct}
                     className="Elemental"
                     style={stylingDef}
                     ref = {idConstruct}
                     />
          )
      }
    }
    return x;
  }
  render(){
      return(<div>{this.elementbuilder()}</div>)
  }
}

class Cell extends React.Component{
  //creates a stateless Cell
  constructor(props){
    super(props)
  }

  render(){
    return(
            <span
                 id={this.props.id}
                 className={this.props.className}
                 style={this.props.style}
                 />
    )
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById("app")
)
