fetch("/me")
.then(response => response.json())

.then(user => {

    const panel = document.getElementById("user-panel");

    if (user.role === "admin") {

        panel.innerHTML = `

            <a href="/admin">Админ-панель</a>

            <a href="/logout">Выйти</a>

        `;

    } else if (user.role === "user") {

        panel.innerHTML = `

            <a href="profile.html">Профиль</a>

            <a href="/logout">Выйти</a>

        `;

    } else {

        panel.innerHTML = `

            <a href="login.html">Войти</a>

            <a href="register.html">Регистрация</a>

        `;

    }

});