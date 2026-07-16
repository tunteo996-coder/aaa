const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");

let img = new Image();

// Hàm dùng chung để tải ảnh
function loadImage(src){

    img.onload = function(){

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);

    }

    img.src = src;
}

// Chọn file
upload.addEventListener("change", e => {

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(ev){

        loadImage(ev.target.result);

    }

    reader.readAsDataURL(file);

});

// Ctrl + V
document.addEventListener("paste", e=>{

    const items = e.clipboardData.items;

    for(const item of items){

        if(item.type.indexOf("image")===-1) continue;

        const file=item.getAsFile();

        const reader=new FileReader();

        reader.onload=function(ev){

            loadImage(ev.target.result);

        }

        reader.readAsDataURL(file);

        e.preventDefault();

        return;
    }

});
