class Game extends React.Component{
  constructor(props){
    super(props)
    this.state={
      playerStyle:{
                    left:0,
                    top:0,
                  }
    }
  }
  drawRooms(){
      let width = 200;
      let height = 300;
      let roomArr=[]
    for(let i=0;i<4;i++){
        let left =((i*width)+ 70 );
      for(let j=0;j<2;j++){
        let top = ((j*height)+ 40 );
        let roomDimensions={
            position: "absolute",
            left:left,
            top:top,
            width:width,
            height:height
        }
        console.log(roomDimensions)
        roomArr.push(
          <div className="room"
               style={roomDimensions}
               />
        )
      }
    }
    return (roomArr)
  }
  playerMovement(e){
    let newLeftPosition = this.state.playerStyle.left;
    let newTopPosition = this.state.playerStyle.top;
    let differential=2;//differential movement
    switch (e.keyCode) {
      case 40:
        //console.log("Player Down")
        newTopPosition+=differential
        break;
      case 38:
        //console.log("Player Up")
        newTopPosition-=differential
        break;
      case 39:
        //console.log("Player Right")
        newLeftPosition+=differential
        break;
      case 37:
        //console.log("Player Left")
        newLeftPosition-=differential
        break;
      default:
        console.log("Non arrow key press")
    }
    if(newTopPosition<0){newTopPosition=0}
    if(newTopPosition>800){newTopPosition=480}
    if(newLeftPosition<0){newLeftPosition=0}
    if(newLeftPosition>480){newLeftPosition=480}
    this.setState({
      playerStyle:{
                    left:newLeftPosition,
                    top:newTopPosition
                  }
    })
  }
  render(){
    return(
      <div id="holder" tabIndex="0" onKeyDown={(e)=>this.playerMovement(e)}>
        {this.drawRooms()}
        <div className="wrapper">
          <Player styling={this.state.playerStyle}/>
          </div>
      </div>
    )
  }
}
class Player extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return(<div id="player" style={this.props.styling}></div>)
  }
}
ReactDOM.render(
  <Game />,
  document.getElementById("app")
)
