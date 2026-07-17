const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const resetBtn = document.getElementById("resetBtn");
const calibrateBtn = document.getElementById("calibrateBtn");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

const distanceText = document.getElementById("distance");
const bearingText = document.getElementById("bearing");
const errorText = document.getElementById("error");

let image = null;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let dragging = false;
let dragStartX = 0;
let dragStartY = 0;

let points = [];
let mousePoint = null;

let calibrating = false;
let meterPerPixel = null;

const MIN_RANGE = 100;
const MAX_RANGE = 700;

// =====================
// DRAW
// =====================

function draw() {

    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!image) return;

    ctx.setTransform(scale,0,0,scale,offsetX,offsetY);

    ctx.drawImage(image,0,0);

    // vòng tròn tầm bắn
    if(meterPerPixel && points.length>0){

        ctx.beginPath();
        ctx.arc(
            points[0].x,
            points[0].y,
            MIN_RANGE/meterPerPixel,
            0,
            Math.PI*2
        );
        ctx.strokeStyle="#00ff00";
        ctx.lineWidth=2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            points[0].x,
            points[0].y,
            MAX_RANGE/meterPerPixel,
            0,
            Math.PI*2
        );
        ctx.strokeStyle="#ff0000";
        ctx.lineWidth=2;
        ctx.stroke();

    }

    // đường preview
    if(points.length===1 && mousePoint){

        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        ctx.lineTo(mousePoint.x,mousePoint.y);

        ctx.setLineDash([10,8]);
        ctx.strokeStyle="#00ffff";
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.setLineDash([]);

    }

    // đường chính
    if(points.length===2){

        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        ctx.lineTo(points[1].x,points[1].y);

        ctx.strokeStyle="#ffff00";
        ctx.lineWidth=3;
        ctx.stroke();

    }

    // điểm
    points.forEach((p,i)=>{

        ctx.beginPath();
        ctx.arc(p.x,p.y,8,0,Math.PI*2);

        ctx.fillStyle=i===0 ? "#00ff00" : "#ff0000";
        ctx.fill();

    });

}

// =====================
// LOAD IMAGE
// =====================

function loadImage(src){

    const img=new Image();

    img.onload=function(){

        image=img;

        canvas.width=img.width;
        canvas.height=img.height;

        scale=1;
        offsetX=0;
        offsetY=0;

        points=[];
        mousePoint=null;

        meterPerPixel=null;
        calibrating=false;

        distanceText.innerText="0 m";
        bearingText.innerText="0°";
        errorText.innerText="Chưa hiệu chuẩn";

        draw();

    };

    img.src=src;

}
// =====================
// UPLOAD
// =====================

upload.addEventListener("change",e=>{

    const file=e.target.files[0];
    if(!file) return;

    const reader=new FileReader();

    reader.onload=ev=>loadImage(ev.target.result);

    reader.readAsDataURL(file);

});

// =====================
// PASTE IMAGE
// =====================

document.addEventListener("paste",e=>{

    for(const item of e.clipboardData.items){

        if(!item.type.startsWith("image")) continue;

        const file=item.getAsFile();

        const reader=new FileReader();

        reader.onload=ev=>loadImage(ev.target.result);

        reader.readAsDataURL(file);

        e.preventDefault();
        return;

    }

});

// =====================
// DRAG DROP
// =====================

canvas.addEventListener("dragover",e=>{

    e.preventDefault();

});

canvas.addEventListener("drop",e=>{

    e.preventDefault();

    const file=e.dataTransfer.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=ev=>loadImage(ev.target.result);

    reader.readAsDataURL(file);

});

// =====================
// RESET
// =====================

resetBtn.onclick=()=>{

    scale=1;
    offsetX=0;
    offsetY=0;

    points=[];
    mousePoint=null;

    meterPerPixel=null;
    calibrating=false;

    distanceText.innerText="0 m";
    bearingText.innerText="0°";
    errorText.innerText="Chưa hiệu chuẩn";

    draw();

};

// =====================
// ZOOM
// =====================

zoomInBtn.onclick=()=>{

    scale*=1.2;
    draw();

};

zoomOutBtn.onclick=()=>{

    scale/=1.2;
    draw();

};

// =====================
// PAN (NÚT GIỮA CHUỘT)
// =====================

canvas.addEventListener("mousedown",e=>{

    if(e.button!==1) return;

    dragging=true;

    dragStartX=e.clientX-offsetX;
    dragStartY=e.clientY-offsetY;

});

window.addEventListener("mouseup",()=>{

    dragging=false;

});

window.addEventListener("mousemove",e=>{

    if(!dragging) return;

    offsetX=e.clientX-dragStartX;
    offsetY=e.clientY-dragStartY;

    draw();

});

// =====================
// CALIBRATE
// =====================

calibrateBtn.onclick=()=>{

    if(!image){
        alert("Hãy mở ảnh trước.");
        return;
    }

    calibrating=true;
    points=[];
    mousePoint=null;

    errorText.innerText="Đang hiệu chuẩn...";

    alert("Hãy click 2 đầu của một ô lưới 100m.");

    draw();

};
// =====================
// ĐO KHI DI CHUỘT
// =====================

canvas.addEventListener("mousemove", e=>{

    if(dragging) return;
    if(points.length!==1) return;

    mousePoint = getMousePos(e);

    if(meterPerPixel){

        const dx=mousePoint.x-points[0].x;
        const dy=mousePoint.y-points[0].y;

        const pixelDistance=Math.sqrt(dx*dx+dy*dy);
        const distanceMeter=pixelDistance*meterPerPixel;

        distanceText.innerText=Math.round(distanceMeter)+" m";

        const angle=Math.atan2(dx,-dy)*180/Math.PI;
        bearingText.innerText=((angle+360)%360).toFixed(1)+"°";

        if(distanceMeter<MIN_RANGE){

            errorText.innerText="Quá gần";

        }else if(distanceMeter>MAX_RANGE){

            errorText.innerText="Ngoài tầm";

        }else{

            errorText.innerText="Trong tầm";

        }

    }

    draw();

});

// =====================
// CLICK
// =====================

canvas.addEventListener("click",e=>{

    if(!image) return;

    const p = getMousePos(e);

const x = p.x;
const y = p.y;

    // ===== HIỆU CHUẨN =====

    if(calibrating){

        points.push({x,y});

        if(points.length===2){

            const dx=points[1].x-points[0].x;
            const dy=points[1].y-points[0].y;

            const pixelDistance=Math.sqrt(dx*dx+dy*dy);

            meterPerPixel=100/pixelDistance;

            calibrating=false;

            points=[];
            mousePoint=null;

            errorText.innerText="Đã hiệu chuẩn";

            alert("Hiệu chuẩn thành công!");

        }

        draw();
        return;

    }

    // ===== CHƯA HIỆU CHUẨN =====

    if(meterPerPixel===null){

        alert("Hãy bấm Calibrate trước.");
        return;

    }

    // ===== ĐO =====

    if(points.length===2){

        points=[];
        mousePoint=null;

    }

    points.push({x,y});

    if(points.length===2){

        mousePoint=null;

        const dx=points[1].x-points[0].x;
        const dy=points[1].y-points[0].y;

        const pixelDistance=Math.sqrt(dx*dx+dy*dy);

        const distanceMeter=pixelDistance*meterPerPixel;

        distanceText.innerText=Math.round(distanceMeter)+" m";

        const angle=Math.atan2(dx,-dy)*180/Math.PI;
        bearingText.innerText=((angle+360)%360).toFixed(1)+"°";

        if(distanceMeter<MIN_RANGE){

            errorText.innerText="Quá gần";

        }else if(distanceMeter>MAX_RANGE){

            errorText.innerText="Ngoài tầm";

        }else{

            errorText.innerText="Trong tầm";

        }

    }

    draw();

});
