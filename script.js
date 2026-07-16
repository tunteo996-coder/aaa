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

function draw(){

    ctx.setTransform(1,0,0,1,0,0);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!image) return;

    ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

    ctx.drawImage(image,0,0);

}

function loadImage(src){

    const img=new Image();

    img.onload=function(){

        image=img;

        canvas.width=img.width;
        canvas.height=img.height;

        scale=1;
        offsetX=0;
        offsetY=0;

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
