import express from "express";
import session from "express-session";

import db from "./db/db.js";

const app = express();
const port = 8001;

// Definir carptea que contiene css/js/images
app.use(express.static('public'));

// Defini carpeta de vistas (html)
app.set('views', './views');
// Definir el motor de vista EJS
app.set('view engine', 'ejs');

// una hora como maximo de vida de la cookie;
var dosHoras = 3600000 * 2;
//session middleware
app.use(session({
    secret: "secretKey",
    saveUninitialized: true,
    cookie: { maxAge: dosHoras },
    resave: false
}));
app.use(express.urlencoded({ extended: true }));

//username and password
const adminUser = {
    'username': 'admin',
    'password': 'admin'
};

const userHector = {
    'username': 'hescudero',
    'password': 'hescudero2023'
};

// Requiere autenticación
app.get("/", (req, res) => {
    res.render("login");
});

// Ruta para manejar la autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUser.username  || username === userHector.username && password === adminUser.password || userHector.password) {
        // Autenticación exitosa, guardar datos usuario en la sesión
        req.session.isAuthenticated = true;
        req.session.username = username;
        req.session.role = 'role';
        res.redirect("inicio");
    } else {
        req.session.isAuthenticated = false;
        res.redirect("login");
    };
});

// Menu Inicio Lista de Municipalidades
app.get("/inicio", (req, res) => {
    if (req.session.isAuthenticated) {
        //console.log(req.session.username);
        const username = req.session.username;
        const role = req.session.role;
        res.render("inicio", {username, role});
    } else {
        res.redirect("/");
    };
});

// Lista de Causas Filtradas Municipalidad de La Reina
app.get("/causas-filtradas-la-reina", async (req, res) => {
    if (req.session.isAuthenticated) {
        const numeroRol = req.query.numeroRol;
        const numPagina = Number(req.query.page) || 0;
        const causasPorPagina = 20;
    
        let collectionCausasLaReina = db.collection("causas_la_reina");
    
        // Definir la consulta base que filtra por materia (daño o choque)
        let consultaBase = { materia: { $in: [/daños en choque/i] } };
    
        // Si se proporciona un número de rol, agregarlo a la consulta
        if (numeroRol) {
            consultaBase.numeroRol = '0' + numeroRol;
        };
    
        // Realizar la búsqueda en la base de datos sin aplicar el límite
        let cantidadCausasLaReina = await collectionCausasLaReina.find(consultaBase).count();
    
        // Calcular la cantidad de páginas basada en el número total de causas sin límite
        let cantidadPaginas = Math.ceil(cantidadCausasLaReina / causasPorPagina);
    
        // Aplicar el límite y la paginación en la consulta final
        let causasLaReina = await collectionCausasLaReina
            .find(consultaBase)
            .skip(numPagina * causasPorPagina)
            .limit(causasPorPagina)
            .toArray();
        let filtroCausas = causasLaReina[0] ? causasLaReina[0].materia : causasLaReina.materia ? causasLaReina.materia : "NINGUNO";
        // Crear un array de números de página para el paginador
        let paginas = [];
        for (let i = 0; i < cantidadPaginas; i++) {
            paginas.push(i);
        };
        res.render("causas-filtradas-la-reina", { causasLaReina, filtroCausas, causasPorPagina, cantidadCausasLaReina, numPagina, cantidadPaginas, paginas });        
    } else {
        res.redirect("/");
    };
});

// Lista de Causas Municipalidad de La Reina
app.get("/causas-la-reina", async (req, res) => {
    if (req.session.isAuthenticated) {
        const numeroRol = req.query.numeroRol;
        const numPagina = Number(req.query.page) || 0;
        const causasPorPagina = 20;
        // Collection de Causas La Reina
        let collectionCausasLaReina = db.collection("causas_la_reina");
        // consulta base para que no devuelva registros vacios
        let consultaBase = {fechaIngreso: { $exists: true }};
        // Si se proporciona un número de rol, agregarlo a la consulta
        if (numeroRol) {
            consultaBase.numeroRol = '0' + numeroRol;
        };
        // Realizar la búsqueda en la base de datos sin aplicar el límite
        let cantidadCausasLaReina = await collectionCausasLaReina.countDocuments();
        // Calcular la cantidad de páginas basada en el número total de causas sin límite
        let cantidadPaginas = Math.ceil(cantidadCausasLaReina / causasPorPagina);
        // Aplicar el límite y la paginación en la consulta final
        let causasLaReina = await collectionCausasLaReina
            .find(consultaBase)
            .skip(numPagina * causasPorPagina)
            .limit(causasPorPagina)
            .toArray();
        let filtroCausas = 'NINGUNO';
        // Crear un array de números de página para el paginador
        let paginas = [];
        for (let i = 0; i < cantidadPaginas; i++) {
            paginas.push(i);
        };
        res.render("causas-la-reina", { causasLaReina, filtroCausas, causasPorPagina, cantidadCausasLaReina, numPagina, cantidadPaginas, paginas });
    } else {
        res.redirect("/");
    };
});


// Lista de Causas Filradas Municipalidad de Las Condes
app.get("/causas-filtradas-las-condes", async (req, res) => {
    if (req.session.isAuthenticated) {
        const numeroRol = req.query.numeroRol;
        const numPagina = Number(req.query.page) || 0;
        const causasPorPagina = 20;
        // Collection de Causas Las Condes
        let collectionCausasLasCondes = db.collection("causas_las_condes");
        // Definir la consulta base que filtra por materia (daño o choque)
        let consultaBase = { materia: { $in: [/choque/i] } };
        // Si se proporciona un número de rol, agregarlo a la consulta
        if (numeroRol) {
            consultaBase.numeroDeRol = '0' + numeroRol;
        };
        // Realizar la búsqueda en la base de datos sin aplicar el límite
        let cantidadCausasLasCondes = await collectionCausasLasCondes.find(consultaBase).count();
        // Calcular la cantidad de páginas basada en el número total de causas sin límite
        let cantidadPaginas = Math.ceil(cantidadCausasLasCondes / causasPorPagina);
        // Aplicar el límite y la paginación en la consulta final
        let causasLasCondes = await collectionCausasLasCondes
            .find(consultaBase)
            .skip(numPagina * causasPorPagina)
            .limit(causasPorPagina)
            .toArray();
        let filtroCausas = causasLasCondes[0] ? causasLasCondes[0].materia : causasLasCondes.materia ? causasLasCondes.materia : "NINGUNO";
        // Crear un array de números de página para el paginador
        let paginas = [];
        for (let i = 0; i < cantidadPaginas; i++) {
            paginas.push(i);
        };
        res.render("causas-filtradas-las-condes", { causasLasCondes, filtroCausas, causasPorPagina, cantidadCausasLasCondes, numPagina, cantidadPaginas, paginas });
    } else {
        res.redirect("/");
    };
});

// Lista de Causas Filradas Municipalidad de Las Condes
app.get("/causas-las-condes", async (req, res) => {
    if (req.session.isAuthenticated) {
        const numeroRol = req.query.numeroRol;
        const numPagina = Number(req.query.page) || 0;
        const causasPorPagina = 20;
        // Collection de Causas Las Condes
        let collectionCausasLasCondes = db.collection("causas_las_condes");
        // consulta base para que no devuelva registros vacios
        let consultaBase = {fechaDeIngreso: { $exists: true }};
        // Si se proporciona un número de rol, agregarlo a la consulta
        if (numeroRol) {
            consultaBase.numeroDeRol = '0' + numeroRol;
        };
        // Realizar la búsqueda en la base de datos sin aplicar el límite
        let cantidadCausasLasCondes = await collectionCausasLasCondes.countDocuments();
        // Calcular la cantidad de páginas basada en el número total de causas sin límite
        let cantidadPaginas = Math.ceil(cantidadCausasLasCondes / causasPorPagina);
        // Aplicar el límite y la paginación en la consulta final
        let causasLasCondes = await collectionCausasLasCondes
            .find(consultaBase)
            .skip(numPagina * causasPorPagina)
            .limit(causasPorPagina)
            .toArray();
        let filtroCausas = "NINGUNO";
        // Crear un array de números de página para el paginador
        let paginas = [];
        for (let i = 0; i < cantidadPaginas; i++) {
            paginas.push(i);
        };
        res.render("causas-las-condes", { causasLasCondes, filtroCausas, causasPorPagina, cantidadCausasLasCondes, numPagina, cantidadPaginas, paginas });
    } else {
        res.redirect("/");
    };
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});