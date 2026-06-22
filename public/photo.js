let isAdmin = false;

fetch("/me")
.then(response => response.json())
.then(user => {

    isAdmin = user.role === "admin";

    console.log("Роль:", user.role);
    console.log("Админ:", isAdmin);

    loadGallery();

});

    let images = [];
let currentIndex = 0;

function loadGallery() {

fetch("/photos")
.then(response => response.json())
.then(files => {

    const gallery = document.getElementById("photo");

    files.forEach(file => {

        if(file === ".keep") return;

        const img = document.createElement("img");

        const imgContainer = document.createElement("div");

        const deleteBtn = document.createElement("button");

        deleteBtn.innerText = "Удалить";
        deleteBtn.className = "delete-btn";

if (isAdmin) {

    imgContainer.appendChild(deleteBtn);

}

deleteBtn.onclick = () => {

    const confirmDelete = confirm(
        "Вы уверены, что хотите удалить фото?"
    );

    if (!confirmDelete) {
        return;
    }

    fetch("/delete-photo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            file: file
        })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        location.reload();

    });

};

        img.src = "/uploads/" + file;
        images.push(img.src);

        img.style.width = "300px";
        img.style.margin = "10px";
        img.style.cursor = "pointer";

        
        img.onclick = () => {

        currentIndex = images.indexOf(img.src);
        
        document.getElementById("modal").style.display = "flex";

        document.getElementById("modal-image").src = img.src;
        
    };

    imgContainer.appendChild(img);

gallery.appendChild(imgContainer);

    });
});


}

document.getElementById("close").onclick = () => {

    document.getElementById("modal").style.display = "none";

};

document.getElementById("prev").onclick = () => {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    document.getElementById("modal-image").src =
        images[currentIndex];

};

document.getElementById("next").onclick = () => {

    currentIndex++;

    if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    document.getElementById("modal-image").src =
        images[currentIndex];

};