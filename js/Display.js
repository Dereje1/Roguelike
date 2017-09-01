class PlayerDisplay extends React.Component{
  constructor(props){
    super(props)
    this.modalClosed=this.modalClosed.bind(this)
  }
  modalClosed(x){
    this.props.modalContinue(x)
  }
  render(){
    let Button = ReactBootstrap.Button;
    return(
      <div id="displayStats">
        <BootstrapModal
          key={this.props.modalDisplay[0]}
          status={this.props.modalDisplay}
          modalResponse={this.modalClosed}
          />
        <div id="playerTask">
          <h1>Kill the boss in dungeon 4      </h1>
          <Button onClick={this.props.lightSwitch}>{this.props.lights ? "Lights Off" : "Lights On"}</Button>
        </div>
        <div id="playerstats">
          <h4>Health = {this.props.main.health+"     "}</h4>
          <h4>Weapon = {this.props.main.weapon+"     "}</h4>
          <h4>Attack = {this.props.main.attack+"     "}</h4>
          <h4>Level = {this.props.main.level+"     "}</h4>
          <h4>Next Level = {this.props.main.nextLevel+"XP     "}</h4>
          <h4>Dungeon = {this.props.main.dungeon+"     "}</h4>
        </div>
      </div>
    )
  }
}

class BootstrapModal extends React.Component{
  constructor(props){
    super(props)
    this.close=this.close.bind(this)
  }
  componentWillMount(){
    this.setState({ showModal: true });
  }

  shouldComponentUpdate(props,nextProps){
    if(this.props.status[0]){return true;}
    else{return false;}
  }
  close(){
  this.setState({ showModal: false },this.props.modalResponse(this.props.status[1]));

  }
  modalfunction(){
    let Modal = ReactBootstrap.Modal;
    let Button = ReactBootstrap.Button;
    let modalTitle= "Some title"
    return(
      <div id="modalformat">
        <Modal show={this.state.showModal} onHide={this.close}>
            <Modal.Header>
              <Modal.Title>{this.props.status[1]}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {this.props.status[2]}
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={this.close}>Continue</Button>
            </Modal.Footer>
       </Modal>
      </div>
    )
  }
  render(){
    if (this.props.status[0]){
      return(
          <div>{this.modalfunction()}</div>
      )
    }
    else{
      return null
    }
  }
}
