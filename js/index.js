class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      walls:[],//array collects all live cell positions
      generations:0,//generation counter
      holderSize:800,
      elementSize:40,//grid elements per board

      player:'0_0',
    }
    //user click cell change
  }
  componentDidMount(){
    //on mount set random cells
  }
  componentWillMount(){
    console.log("about to mount")
    let findWalls = cellAutomata(this.state.elementSize);

    this.setState({
      walls:findWalls,
      player:this.placeRandomObject(findWalls)
    })
  }
  placeRandomObject(walls){
    let areaCovered = Math.pow(this.state.elementSize,2)
    for (let i=0;i<areaCovered;i++){
      let y = Math.floor(Math.random() * this.state.elementSize)
      let x = Math.floor(Math.random() * this.state.elementSize)
      let stringCoords = y.toString()+"_"+x.toString()
      if(!walls.includes(stringCoords)){
        return stringCoords;
      }
    }
    placeRandomObject(walls)
  }

  playerMovement(e){

    let currentPlayerPosition = this.state.player.split("_").map(function(z){
      return parseInt(z,10)
    });

    let newPosition=[]
    console.log(currentPlayerPosition)
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
        console.log("Non arrow key press")
    }
    console.log(newPosition)
    let newPositionString = newPosition[0]+"_"+newPosition[1];
    if(this.state.walls.includes(newPositionString)){
      console.log("out of bounds")
      return;
    }
    if((newPosition[0]<0)||(newPosition[0]>this.state.elementSize-1)){
      console.log("out of bounds")
      return;
    }
    if((newPosition[1]<0)||(newPosition[1]>this.state.elementSize-1)){
      console.log("out of bounds")
      return;
    }
    $("#"+this.state.player).css("background-color", "white")

    this.setState({
      player:newPositionString
    })
    $("#"+newPositionString).css("background-color", "blue")
  }

  render(){
    let holderStyling={
      width:this.state.holderSize,
      height: this.state.holderSize
    }
    return(
      <div>
        <div id="elementHolder" tabIndex="0" style={holderStyling} onKeyDown={(e)=>this.playerMovement(e)}>
            <GridMaker
              holderSize ={this.state.holderSize}
              elementSize={this.state.elementSize}
              player={this.state.player}
              walls = {this.state.walls}
              cellRef={(input) => this.x = input }
            />
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
    console.log(this.props.player)
    let x=[],bcol;
    //find element width
    let elementWidth = (this.props.holderSize/this.props.elementSize).toString()+"px"
    for (let i=0;i<this.props.elementSize;i++){
      for(let j=0;j<this.props.elementSize;j++){
          //construct id string cell coords
          let idConstruct = i.toString()+"_"+j.toString();
          //set color of cell if alive
          if(this.props.walls.includes(idConstruct)){bcol="grey"}
          else if(idConstruct===this.props.player){bcol="blue"}
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
