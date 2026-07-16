const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");

let img = new Image();

upload.addEventListener("change", e => {

    const file = e.target.files[0];
    if (!file) return;

    img.onload = function(){

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0);

    }

    img.src = URL.createObjectURL(file);

});
