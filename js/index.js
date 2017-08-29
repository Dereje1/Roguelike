class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      walls:[],//array collects all live cell positions
      generations:0,//generation counter
      holderSize:800,
      elementSize:40,//grid elements per board

      positionsOccupied:{},
      allPoints:{}
    }
    //user click cell change
  }
  componentDidMount(){
    //on mount set random cells
  }
  componentWillMount(){
    console.log("about to mount")
    let walls = cellAutomata(this.state.elementSize);
    let wallPercent = walls.length/Math.pow(this.state.elementSize,2)
    console.log(wallPercent)
    while (wallPercent>0.5){
      walls = cellAutomata(this.state.elementSize);
      wallPercent = walls.length/Math.pow(this.state.elementSize,2)
      console.log(wallPercent)
    }
    let allOccupiedPositions = this.placeGameObjects(walls);
    let points = this.pointsAssement(true)
    this.setState({
      walls:walls,
      positionsOccupied:allOccupiedPositions,
      allPoints:points
    })
  }
  placeGameObjects(walls){
    let boxSizeArray = Array.apply(null, {length: this.state.elementSize}).map(Number.call, Number)
    let allOccupied=[]
    let positions={}


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
    let food=[], enemies=[]
    let player = allOccupied.shift();
    let copyOccupied = allOccupied.slice();//copy because I want this value also in the state object
    for(let i=0;i<5;i++){food.push(copyOccupied.shift())}
    for(let i=0;i<5;i++){enemies.push(copyOccupied.shift())}
    let weapon = copyOccupied.shift()
    let dungeon = copyOccupied.shift()


    positions.player = player;
    positions.food = food;
    positions.enemies = enemies;
    positions.weapon = weapon;
    positions.dungeon = dungeon;
    positions.allPositions = allOccupied;

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
        break;
      case 38:
        //console.log("Player Up")
        newPosition=[currentPlayerPosition[0]-1,currentPlayerPosition[1]]
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
    //this.visibleArea(currentPlayerPosition,newPosition)
    let newPositionString = newPosition[0]+"_"+newPosition[1];
    if(this.state.walls.includes(newPositionString)){
      //console.log("out of bounds")
      return;
    }
    if(positionsCopy.allPositions.includes(newPositionString)){
      //console.log("out of bounds")
      this.gamePlay(positionsCopy,newPositionString)
      return;
    }
    if((newPosition[0]<0)||(newPosition[0]>this.state.elementSize-1)){
      //console.log("out of bounds")
      return;
    }
    if((newPosition[1]<0)||(newPosition[1]>this.state.elementSize-1)){
      //console.log("out of bounds")
      return;
    }
    $("#"+positionsCopy.player).css("background-color", "white")
    positionsCopy.player = newPositionString;
    this.setState({
      positionsOccupied:positionsCopy
    })
    $("#"+newPositionString).css("background-color", "blue")
  }

  gamePlay(positionsObj,newpos){
    let positionKeys = Object.keys(positionsObj)
    let pointsCopy = JSON.parse(JSON.stringify(this.state.allPoints))
    for(let i=0;i<positionKeys.length;i++){
      if(positionKeys[i]==="allPositions"){continue}
      if(positionsObj[positionKeys[i]].includes(newpos)){
        console.log("this is a " + positionKeys[i])
        switch (positionKeys[i]) {
          case "food":
            pointsCopy.health+=20
            this.setState({
              allPoints:pointsCopy
            })
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
            break;
          default:

        }
      }
    }
  }
  visibleArea(oldposition,newPosition){
      let newPositionString = "#"+newPosition[0]+"_"+newPosition[1];
      console.log("Div Holder Position ")
      console.log($("#elementHolder").position())
      console.log("player Position ")
      console.log($(newPositionString).position())
      if(newPosition[0]!==oldposition[0]){
        $("#elementHolder").scrollTop($(newPositionString).position().top-this.state.elementSize);
      }
  }

  render(){
    let holderStyling={
      width:this.state.holderSize,
      height: this.state.holderSize/2
    }
    return(
      <div>
        <div id="elementHolder" tabIndex="0" style={holderStyling} onKeyDown={(e)=>this.playerMovement(e)}>
            <GridMaker
              holderSize ={this.state.holderSize}
              elementSize={this.state.elementSize}
              positions={this.state.positionsOccupied}
              walls = {this.state.walls}
              cellRef={(input) => this.x = input }
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
  shouldComponentUpdate(nextProps){
    return false;
  }
  elementbuilder(){
    //builds all cells
    console.log("rendering all Grid Elements")
    console.log(this.props.positions)
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
  testref(){
  console.log("hello")
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
