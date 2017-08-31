class PlayerDisplay extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return(
      <div id="displayStats">
        <BootsrapModal status={this.props.modalDisplay}/>
        <p>Helath = {this.props.main.health}</p>
        <p>Weapon = {this.props.main.weapon}</p>
        <p>Attack = {this.props.main.attack}</p>
        <p>Level = {this.props.main.level}</p>
        <p>Next Level = {this.props.main.nextLevel}</p>
        <p>Dungeon = {this.props.main.dungeon}</p>
      </div>
    )
  }
}

class BootsrapModal extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    if (this.props.status){
      return(
          <h1>Wait for modal</h1>
      )
    }
    else{
      return null
    }
  }
}
