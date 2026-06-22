const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const session = require("express-session");

const fs = require("fs");

const bcrypt = require("bcrypt");

const express = require("express");

const path = require("path");

const nodemailer = require("nodemailer");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});

cloudinary.config({
    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "vdyikanova@gmail.com",
        pass: "phhk enzp weje dpot"
    }
});

transporter.verify((error, success) => {

    if (error) {
        console.log(error);
    } else {
        console.log("SMTP готов");
    }

});

const upload = multer({ storage });

const app = express();

app.use(session({
    secret: "vview-super-secret-key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, "public")));

const users = JSON.parse(
    fs.readFileSync("users.json", "utf8")
);

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(
        u =>
        u.username === username
    );

    if (!user) {
        return res.send("Неверный логин или пароль");
    }
    
    const isMatch = await bcrypt.compare(
        password,
        user.password
    );
    if (!isMatch) {
        return res.send("Неверный логин или пароль");
    }

req.session.user = {
    username: user.username,
    role: user.role
};

    if (user.role === "admin") {
        return res.redirect("/admin");
}
    return res.redirect("/");
});

app.post("/register", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const email = req.body.email;

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        username: username,
        email: email,
        password: hashedPassword,
        role: "user"
    });
fs.writeFileSync(
    "users.json",
    JSON.stringify(users, null, 4)
);

    res.redirect("/");
});

app.get("/admin", (req, res) => {

    if (!req.session.user) {
        return res.send("Сначала войдите в систему");
    }

    if (req.session.user.role !== "admin") {
        return res.send("Доступ запрещен");
    }

    res.sendFile(
        path.join(__dirname, "private", "admin.html")
    );
});

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/");

    });

});

app.post("/forgotpassword", async (req, res) => {

    const email = req.body.email;

    const user = users.find(
        u => u.email === email
    );

    if (!user) {
        return res.send("Пользователь не найден");
    }

    const token = Date.now().toString();

    user.resetToken = token;

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 4)
    );

    const resetLink =
        `https://vview-site.onrender.com/resetpassword/${token}`;

console.log(resetLink);

res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="/style.css">
<title>Восстановление пароля</title>
</head>

<body>

<div class="login-container">

<h2>Восстановление пароля</h2>

<a href="${resetLink}">
Сменить пароль
</a>

</div>

</body>
</html>
`);
});


app.get("/resetpassword/:token", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "resetpassword.html")
    );

});

app.post("/resetpassword", async (req, res) => {

    const token =
    req.body.token;
    
    const password =
    req.body.password;

    const user = users.find(
        u => u.resetToken === token
    );

    if (!user) {
        return res.send("Ссылка недействительна");
    }

    user.password =
    await bcrypt.hash(password, 10);

    delete user.resetToken;

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 4)
    );

    res.send("Пароль успешно изменен");
});

app.post(
    "/upload-photo",
    upload.single("photo"),
    (req, res) => {

        res.send("Фото успешно загружено!");

    }
);

app.get("/photos", (req, res) => {

    if (!fs.existsSync("public/uploads")) {
        return res.json([]);
    }

    const files = fs.readdirSync("public/uploads");

    res.json(files);

});;

app.use(express.json());

function isAdmin(req) {
    return req.user && req.user.role === "admin";
}

app.post("/delete-photo", (req, res) => {

    if (
        !req.session.user ||
        req.session.user.role !== "admin"
    ) {
        return res.status(403).send("Нет доступа");
    }
    
    const fileName = req.body.file;

    const filePath = path.join(__dirname, "public/uploads", fileName);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.send("Ошибка удаления");
        }

        res.send("Фото удалено");
    });
});

const songStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/songs");
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        cb(
            null,
            Date.now() + ext);
    }
});

const songUpload = multer({
    storage: songStorage
});

app.post(
    "/upload-song",
    songUpload.single("song"),
    async (req, res) => {

        try {

    await cloudinary.uploader.upload(
        req.file.path,
        {
            resource_type: "video",
            folder: "songs"
        }
    );
            fs.unlinkSync(req.file.path);

            res.send(
                "Песня загружена"
            );

        } catch (err) {

            console.log(err);

            res.send(
               "Ошибка загрузки"
            );

        }

    }
);

app.post("/delete-song", async (req, res) => {

    if (
        !req.session.user ||
        req.session.user.role !== "admin"
    ) {
        return res.status(403)
            .send("Нет доступа");
    }

    try {

    await cloudinary.uploader.destroy(
        req.body.public_id,
        {
            resource_type: "video"
        }
    );

       res.send(
        "Песня удалена"
    );
    } catch(err) {

        console.log(err);
        console.log("Удаляем", req.body.public_id);

        const result = await cloudinary.uploader.destroy(
            req.body.public_id,
            {
                resource_type: "video" 
            }
    );

    console.log(result);
        res.send("Ошибка удаления");
    
    }    

});

app.get("/songs-list", async (req, res) => {

    try {

        const result =
            await cloudinary.search
            .expression("folder:songs")
            .sort_by("created_at", "desc")
            .max_results(100)
            .execute();

    const songs =
        result.resources.map(song => ({

            title:
                song.filename,

            url:
                song.secure_url,

            public_id:
                song.public_id

            })
        );

    res.json(songs);

} catch (err) {

    console.log(err);

    res.status(500).json([]);
    
    }

});

app.get("/me", (req, res) => {

    if (!req.session.user) {
        return res.json({
            role: "guest"
        });
    }

    res.json({
        role: req.session.user.role,
        username: req.session.user.username
    });

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});