//makes cave walls an extension of the logic from game of life project
function cellAutomata(boxSize){
  let allWalls = initialWall(boxSize,0.48);//probability param for wall
  for (let i=0;i<5;i++){//run cellAutomata 5 times
    allWalls = findWalledCells(allWalls,boxSize,i)
  }
  let floodFilledWalls = floodFill(allWalls,boxSize);

  return floodFilledWalls;
}

function findWalledCells(allWalls,boxSize,i){
  //function returns new state of live cells on board
  let newState=[];
  //run grid till box size
  for(let i=0;i<boxSize;i++){
    for(let j=0;j<boxSize;j++){
      let cellId = i.toString()+"_"+j.toString();
      let totalwalledNb = walledNeighbours(cellId,allWalls,boxSize)
      if(allWalls.includes(cellId)){
        if (totalwalledNb >= 4){newState.push(cellId)}
      }
      else{
        switch (i) {//trying to make walls more realistic for the different automata iterations
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

function walledNeighbours(cell,alive,boxSize){//finds walled neighbours for a given cell
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
  //initial random placement of walls
  //set wall probability , p for different results
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
  let allDisjoint=[];
  let disjoint=[];
  let copyOfWalls = allwalls.slice()//don't modify original walls
  let openSpace=0;
  for(let i=0;i<boxSize;i++){
    for(let j=0;j<boxSize;j++){
      let stringCoords = i.toString()+"_"+j.toString();
      if(!copyOfWalls.includes(stringCoords)){//it's a floorspace found
          //new open space reset old
          disjoint=[]
          //run recursive function on open space
          pathWayFinder(stringCoords)
          //push into all open space array once recursive function is done
          allDisjoint.push(disjoint)
      }
    }
  }
  //floodFillTroublShoot(allwalls,allDisjoint)
  return findBestPath()

  function findBestPath(){
    //returns maximum of all disjoints found
    let longestPathWay=0;
    let floodFilledWalls =[]
    let disjointArrLength=allDisjoint.map(function(pathway){
      return pathway.length
    })
    let longestArr = allDisjoint[disjointArrLength.indexOf(Math.max.apply(null,disjointArrLength))]

    for(let i=0;i<boxSize;i++){
      for(let j=0;j<boxSize;j++){
        let stringCoords = i.toString()+"_"+j.toString();
          if(!longestArr.includes(stringCoords)){
            floodFilledWalls.push(stringCoords)
          }
        }
      }
      return floodFilledWalls
    }
  function pathWayFinder(floorId){
      //discount open floor
      copyOfWalls.push(floorId)
      //account open floor
      if(!disjoint.includes(floorId)){disjoint.push(floorId)}
      //find all possible neighbours without wraping considerations
      let n = possibleNeighbours(floorId,boxSize,false)
      //exclude walled neighbours
      let floorNeighbours=n.filter(function(z){
        if(!copyOfWalls.includes(z)){return z;}
      });
      //if open Neigbhours still exist run this function again
      if (floorNeighbours.length!==0){
        for (let u=0;u<floorNeighbours.length;u++){
          pathWayFinder(floorNeighbours[u])
        }
      }
      else{//otherwise done , go to next pathway
        return;
      }
  }
}

function floodFillTroublShoot(finalwalls,allDisjoint){
  //run this function to trouble shoot the flood filling techniques
  $( document ).ready(function() {
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
  });
}
