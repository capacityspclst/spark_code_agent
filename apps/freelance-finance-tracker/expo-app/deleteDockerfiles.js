const fs = require('fs');
const path = require('path');
function deleteFile(p){
  try{fs.unlinkSync(p);}catch(e){}
}
function deleteDir(p){
  try{fs.rmdirSync(p, {recursive:true});}catch(e){}
}
function walk(dir){
  fs.readdirSync(dir,{withFileTypes:true}).forEach(entry=>{
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      if(entry.name === '.devcontainer'){
        // delete Dockerfile and base.Dockerfile inside
        deleteFile(path.join(full,'Dockerfile'));
        deleteFile(path.join(full,'base.Dockerfile'));
        deleteDir(full);
      } else {
        walk(full);
      }
    }
  });
}
walk(path.resolve(__dirname,'node_modules'));
console.log('Deleted recast Dockerfiles');
