class PlayerDisplay extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return(
      <div id="displayStats">
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
