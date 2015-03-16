document.write('<!doctype html>'+document.getElementsByTagName('html')[0].innerHTML.replace(/<iframe|<script/g,'<style').replace(/<\/iframe|<\/script/g,'</style'));

function _X(x){
  var d=document.getElementsByClassName('download')[x];
  d.removeChild(d.getElementsByTagName('a')[2]);
}

function _Y(){
  var a=document.getElementById('details'), b = a.getElementsByTagName('a');
  for(i in b)
    if(b[i].parentElement == a && b[i].target == '_blank')
      a.removeChild(b[i]);
}

try{
  _Y();
}catch(e){}

try{
  _X(0);
  _X(1);
}catch(e){}
