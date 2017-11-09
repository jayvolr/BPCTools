var ribbon = document.getElementById('infoRibbon') || document.getElementById('errorRibbon');

if (!!ribbon) {
  setTimeout(function(){
    ribbon.style.top = '-100px';
  }, 1200);
}
