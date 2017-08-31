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
          else if(idConstruct===this.props.positions.dragon){bcol="#ff69b4"}
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
