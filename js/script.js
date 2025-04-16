document.getElementById('fullscreenBtn').onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };
  
  document.getElementById('infoBtn').onclick = () => {
    document.getElementById('info-layer').style.display = 'block';
  };