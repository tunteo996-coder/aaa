const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const resetBtn = document.getElementById("resetBtn");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

let image = null;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let points = [];

const distanceText = document.getElementById("distance");
const bearingText = document.getElementById("bearing");
const errorText = document.getElementById("error");

function draw(){

    ctx.setTransform(1,0,0,1,0,0);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!image) return;

    ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

    ctx.drawImage(image,0,0);
    points.forEach((p,index)=>{

    ctx.beginPath();
    ctx.arc(p.x,p.y,8,0,Math.PI*2);

    ctx.fillStyle=index===0 ? "#00ff00" : "#ff0000";
    ctx.fill();

});

if(points.length===2){

    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    ctx.lineTo(points[1].x,points[1].y);
    ctx.strokeStyle="#ffff00";
    ctx.lineWidth=3;
    ctx.stroke();

}

}

function loadImage(src){

    const img=new Image();

    img.onload = function(){

    image = img;

    canvas.width = img.width;
    canvas.height = img.height;

    scale = 1;
    offsetX = 0;
    offsetY = 0;

    points = [];

    distanceText.innerText = "0 m";
    bearingText.innerText = "0°";
    errorText.innerText = "±0 m";

    draw();

}

    img.src=src;

}

upload.addEventListener("change",e=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=ev=>{

        loadImage(ev.target.result);

    }

    reader.readAsDataURL(file);

});

document.addEventListener("paste",e=>{

    const items=e.clipboardData.items;

    for(const item of items){

        if(!item.type.startsWith("image")) continue;

        const file=item.getAsFile();

        const reader=new FileReader();

        reader.onload=ev=>{

            loadImage(ev.target.result);

        }

        reader.readAsDataURL(file);

        e.preventDefault();

        return;

    }

});

canvas.addEventListener("dragover",e=>{

    e.preventDefault();

});

canvas.addEventListener("drop",e=>{

    e.preventDefault();

    const file=e.dataTransfer.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=ev=>{

        loadImage(ev.target.result);

    }

    reader.readAsDataURL(file);

});

resetBtn.onclick=function(){

    scale=1;
    offsetX=0;
    offsetY=0;

    draw();

}
document.body.addEventListener("click", () => {
    canvas.focus();
});
canvas.addEventListener("mousedown", e => {
    if (e.button !== 1) return;

    dragging = true;

    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;

});

window.addEventListener("mouseup", () => {

    dragging = false;

});

window.addEventListener("mousemove", e => {

    if (!dragging) return;

    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;

    draw();

});
zoomInBtn.onclick = () => {

    scale *= 1.2;

    draw();

};

zoomOutBtn.onclick = () => {

    scale /= 1.2;

    draw();

};
canvas.addEventListener("click",e=>{

    if(!image) return;

    const rect=canvas.getBoundingClientRect();

    const x=(e.clientX-rect.left-offsetX)/scale;
    const y=(e.clientY-rect.top-offsetY)/scale;

    if(points.length===2){
        points=[];
    }

    points.push({x,y});

    if(points.length===2){

        const dx=points[1].x-points[0].x;
        const dy=points[1].y-points[0].y;

        const pixelDistance=Math.sqrt(dx*dx+dy*dy);

        distanceText.innerText=Math.round(pixelDistance)+" px";

        const angle=Math.atan2(dx,-dy)*180/Math.PI;

        bearingText.innerText=((angle+360)%360).toFixed(1)+"°";

        errorText.innerText="Chưa hiệu chuẩn";

    }

    draw();

});
