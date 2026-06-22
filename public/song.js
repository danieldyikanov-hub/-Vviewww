fetch("/me")
.then(res => res.json())
.then(user => {

    const isAdmin = user.role === "admin";

fetch("/songs-list")
.then(response => response.json())
.then(files => {

    const songs = document.getElementById("songs");

    files.forEach(song => {

        const wrapper =
            document.createElement("div");

        const audio =
            document.createElement("audio");

        audio.controls = true;

        audio.src = song.url;

        wrapper.appendChild(audio);

        if (isAdmin) {

const deleteBtn = document.createElement("button");

deleteBtn.innerText ="🗑";

deleteBtn.onclick = () => {

    const confirmed = confirm(
        "Вы уверены, что хотите удалить эту песню?"
    );

    if (!confirmed)
        return;

    fetch("/delete-song", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
    public_id:
        song.public_id
})
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        location.reload();

    });

};

wrapper.appendChild(deleteBtn);
}

songs.appendChild(wrapper);

songs.appendChild(
    document.createElement("br")
);
});