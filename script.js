const van = document.getElementById('van');
const PX_PER_CM_X = 300/143;
const PX_PER_CM_Y = 576/247;

const initialState = {};
function captureInitial(){
  document.querySelectorAll('.cell').forEach(el=>{
    initialState[el.id] = el.getAttribute('style');
  });
}

function updateLiveCm(el){
  const liveEl = el.querySelector('.livecm');
  if(!liveEl) return;
  const wCm = Math.round(el.offsetWidth / PX_PER_CM_X);
  const hCm = Math.round(el.offsetHeight / PX_PER_CM_Y);
  liveEl.textContent = hCm + ' × ' + wCm + ' cm';
}

const CAB_BOUNDARY = 146; // px, bottom edge of the cab shape

function getInteriorBounds(y){
  if(y>=146) return {left:15,right:285};
  const t=Math.max(0,Math.min(1,y/146));
  return {
    left:45-(30*t),
    right:255+(30*t)
  };
}


function makeDraggable(el){
  let startX, startY, startLeft, startTop, dragging=false;
  const minTop = (['platform','fridge','fridge2','toilet','shower'].includes(el.id)) ? CAB_BOUNDARY : 0;

  el.addEventListener('mousedown', (e)=>{
    if(e.target.classList.contains('resize-handle')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startLeft = el.offsetLeft; startTop = el.offsetTop;
    el.style.zIndex = 50;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    let newLeft = startLeft + (e.clientX - startX);
    let newTop = startTop + (e.clientY - startY);
    newTop=Math.max(minTop,Math.min(newTop,van.clientHeight-el.offsetHeight));
    const b=getInteriorBounds(newTop);
    newLeft=Math.max(b.left,Math.min(newLeft,b.right-el.offsetWidth));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
  });
  window.addEventListener('mouseup', ()=>{
    dragging = false;
    el.style.zIndex = '';
  });

  el.addEventListener('touchstart', (e)=>{
    if(e.target.classList.contains('resize-handle')) return;
    dragging = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startLeft = el.offsetLeft; startTop = el.offsetTop;
  }, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    if(!dragging) return;
    const t = e.touches[0];
    let newLeft = startLeft + (t.clientX - startX);
    let newTop = startTop + (t.clientY - startY);
    newTop=Math.max(minTop,Math.min(newTop,van.clientHeight-el.offsetHeight));
    const b=getInteriorBounds(newTop);
    newLeft=Math.max(b.left,Math.min(newLeft,b.right-el.offsetWidth));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
  }, {passive:true});
  window.addEventListener('touchend', ()=>{ dragging = false; });
}

function makeResizable(el){
  const handle = el.querySelector('.resize-handle');
  if(!handle) return;
  let startX, startY, startW, startH, resizing=false;

  handle.addEventListener('mousedown', (e)=>{
    resizing = true;
    startX = e.clientX; startY = e.clientY;
    startW = el.offsetWidth; startH = el.offsetHeight;
    el.style.zIndex = 50;
    e.stopPropagation();
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!resizing) return;
    let newW = Math.max(30, startW + (e.clientX - startX));
    let newH = Math.max(30, startH + (e.clientY - startY));
    newW = Math.min(newW, van.clientWidth - el.offsetLeft);
    newH = Math.min(newH, van.clientHeight - el.offsetTop);
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';
    updateLiveCm(el);
  });
  window.addEventListener('mouseup', ()=>{
    resizing = false;
    el.style.zIndex = '';
  });

  handle.addEventListener('touchstart', (e)=>{
    resizing = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startW = el.offsetWidth; startH = el.offsetHeight;
    e.stopPropagation();
  }, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    if(!resizing) return;
    const t = e.touches[0];
    let newW = Math.max(30, startW + (t.clientX - startX));
    let newH = Math.max(30, startH + (t.clientY - startY));
    newW = Math.min(newW, van.clientWidth - el.offsetLeft);
    newH = Math.min(newH, van.clientHeight - el.offsetTop);
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';
    updateLiveCm(el);
  }, {passive:true});
  window.addEventListener('touchend', ()=>{ resizing = false; });
}

document.querySelectorAll('.cell').forEach(el=>{
  makeDraggable(el);
  makeResizable(el);
});

captureInitial();

document.getElementById('resetBtn').addEventListener('click', ()=>{
  Object.keys(initialState).forEach(id=>{
    const el = document.getElementById(id);
    el.setAttribute('style', initialState[id]);
  });
  document.querySelectorAll('.cell').forEach(updateLiveCm);
});

let zoomLevel = 1;
const planWrap = document.getElementById('planWrap');
function applyZoom(){
  planWrap.style.transform = 'scale(' + zoomLevel + ')';
}
document.getElementById('zoomOutBtn').addEventListener('click', ()=>{
  zoomLevel = Math.max(0.4, +(zoomLevel - 0.1).toFixed(2));
  applyZoom();
});
document.getElementById('zoomInBtn').addEventListener('click', ()=>{
  zoomLevel = Math.min(1.5, +(zoomLevel + 0.1).toFixed(2));
  applyZoom();
});
document.getElementById('zoomResetBtn').addEventListener('click', ()=>{
  zoomLevel = 1;
  applyZoom();
});

const extDims = {
  p2: '4710 × 1804 × 1466 mm (L × W × H)',
  p3: '4823 × 1861 × 1547 mm (L × W × H)'
};
const exteriorDimsEl = document.getElementById('exteriorDims');
const p2Btn = document.getElementById('p2Btn');
const p3Btn = document.getElementById('p3Btn');
function setGen(gen){
  exteriorDimsEl.textContent = 'Exterior: ' + extDims[gen];
  if(gen === 'p2'){
    p2Btn.style.background = 'var(--accent)'; p2Btn.style.color = 'var(--cream)';
    p3Btn.style.background = 'var(--cream)'; p3Btn.style.color = 'var(--ink)';
  } else {
    p3Btn.style.background = 'var(--accent)'; p3Btn.style.color = 'var(--cream)';
    p2Btn.style.background = 'var(--cream)'; p2Btn.style.color = 'var(--ink)';
  }
}
p2Btn.addEventListener('click', ()=> setGen('p2'));
p3Btn.addEventListener('click', ()=> setGen('p3'));
