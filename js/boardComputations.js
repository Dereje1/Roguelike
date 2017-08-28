let allDisjoint=[]
let finalwalls=''
function cellAutomata(boxSize){
  let allWalls = initialWall(boxSize,0.45);
  for (let i=0;i<5;i++){
    allWalls = findWalledCells(allWalls,boxSize,i)
  }
  finalwalls=allWalls.slice()
  floodFill(allWalls,boxSize)
  return allWalls;
}
function findWalledCells(allWalls,boxSize,i){
  //function returns new state of live cells on board
  let newState=[];
  //run grid till box size
  for(let i=0;i<boxSize;i++){
    for(let j=0;j<boxSize;j++){
      let cellId = i.toString()+"_"+j.toString();
      //find total liveNeighbours for each and every cell , even if dead
      //this is probably what is taxing the most computation time
      //look for improvements here!!
      let totalwalledNb = walledNeighbours(cellId,allWalls,boxSize)
      //if((totalwalledNb>3)&&(totalwalledNb<2)){break;}
      //if target cell is already alive
      if(allWalls.includes(cellId)){
        if (totalwalledNb >= 4){newState.push(cellId)}
      }
      else{//if it is dead
        switch (i) {
          case (i===4):
                if((totalwalledNb>=5)||(totalwalledNb<=2)){
                  newState.push(cellId)
                }
            break;
          case (i===3):
                if((totalwalledNb>=5)||(totalwalledNb<=2)){
                  newState.push(cellId)
                }
            break;
          default:
              if(totalwalledNb>=5){
                newState.push(cellId)
              }
        }

      }
    }
  }
  return newState;
}

function walledNeighbours(cell,alive,boxSize){//finds live neighbours for a given cell
    //first needs to find all 8 neighbours

    //then test to see if any of them are alive, if so send total count
    let filteredNeigbhours=possibleNeighbours(cell,boxSize).filter(function(z){
     if(alive.includes(z)){return z}
    })
    return filteredNeigbhours.length
  }

function possibleNeighbours(cell,boxSize,wrap=true){
  //finds all potential neighbours for any given cell
  //box size is used for finding boundries to wrap around
  let cellCoordinates = cell.split("_");
  //convert to numbers
  cellCoordinates=cellCoordinates.map(function(u){
    return parseInt(u,10)
  })
  //all 8 neighbours

    let transformArray = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
    let possibleNeighbours=[]
    while (transformArray.length > 0){
      let neighbour;
      if(wrap){
          neighbour = cellCoordinates.map(function(current,idx){
          let transformed = current + transformArray[0][idx];
          if (transformed<0){return (boxSize-1)}
          else if (transformed>(boxSize-1)){return 0}
          else {return transformed}
        })
      }
      else{
          neighbour = cellCoordinates.map(function(current,idx){
          let transformed = current + transformArray[0][idx];
          if (transformed<0){return null}
          else if (transformed>(boxSize-1)){return null}
          else {return transformed}
        })
      }
      if((neighbour[0]!==null)&&(neighbour[1]!==null)){
        possibleNeighbours.push(neighbour)
      }
      transformArray.shift()
    }
  //convert back to string and adjust for boundry conditions
  possibleNeighbours=possibleNeighbours.map(function(u){
    return (u[0].toString()+"_"+u[1].toString())
  })
  return possibleNeighbours;
}

function initialWall(boxSize,p){
  let newState=[]
  for(let i=0;i<boxSize;i++){
    for(let j=0;j<boxSize;j++){
      let wallP = (Math.random()<=p);
      let stringCoords = i.toString()+"_"+j.toString();
      if(wallP){newState.push(stringCoords)}
    }
  }
  return newState;
}

function floodFill(allwalls,boxSize){
  let disjoint=[];
  let copyOfWalls = allwalls.slice()
  let openSpace=0;
  for(let i=0;i<boxSize;i++){
    for(let j=0;j<boxSize;j++){
      let stringCoords = i.toString()+"_"+j.toString();
      if(!copyOfWalls.includes(stringCoords)){//it's a floorspace found
          //new open space
          disjoint=[]
          openSpaceCloser(stringCoords)
          allDisjoint.push(disjoint)
      }
    }
  }

  function openSpaceCloser(floorId){
      copyOfWalls.push(floorId)
      if(!disjoint.includes(floorId)){disjoint.push(floorId)}

      let n = possibleNeighbours(floorId,boxSize,false)
      //exclude walled neighbours
      let floorNeighbours=n.filter(function(z){
        if(!copyOfWalls.includes(z)){return z;}
      });
      //console.log("openSpace ID " + openSpaceId + " FlooR ID "+ floorId)
      //console.log(floorNeighbours)
      if (floorNeighbours.length!==0){
        for (let u=0;u<floorNeighbours.length;u++){
          openSpaceCloser(floorNeighbours[u])
        }
      }
      else{
        return;
      }
  }
}
$( document ).ready(function() {
  floodFillTroublShoot()
});

function floodFillTroublShoot(){
  let colors = ["green","yellow","red","purple","orange"]
  let painted=[]
  console.log( "ready!" );
  for (let z=0;z<allDisjoint.length;z++){
    let randomColor= colors[Math.floor(Math.random() * colors.length)]
    for(let q=0;q<allDisjoint[z].length;q++){
      let disjointCell = allDisjoint[z][q];
      if(finalwalls.includes(disjointCell)){
        console.log("Warning " + disjointCell + "Is already a Wall")
        break;
      }
      else{
        if(painted.includes(disjointCell)){
          console.log(disjointCell + " Has already been painted!!")
        }
        else{
          painted.push(disjointCell)
          $("#"+disjointCell).css("background-color", randomColor)
          if(q===allDisjoint[z].length-1){colors.splice(colors.indexOf(randomColor),1)}
        }
      }
    }
  }
  console.log(finalwalls)
  console.log(allDisjoint)
  //$("#9_0").css("background-color", "yellow")
}
