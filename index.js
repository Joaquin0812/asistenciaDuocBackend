const express = require('express')
const app = express()
const cors = require("cors")
const port = 3000

//conexion a mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Veneta0812.',
    database: 'asistenciaduoc'
});

connection.connect();


//connection.end();


app.use(express.json())
app.use(cors())

//lógica para el login
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    console.log(username)
    console.log(password)

    //obteniendo dominio del correo ingresado
    const dominio = username.split("@")[1]

    //lógica para un usuario alumno
    if (dominio == "duoc.cl") {
        const query = `select * from alumno where correo="${username}" and password="${password}";`
        connection.query(query, function (error, results, fields) {
            if (error) {
                res.status(500).send("db_error")
            }
            if (results.length == 0) {
                console.log("invalid credentials");
                res.status(400).send("invalid credentials")
            } else {
                results[0].password = null
                res.send(results[0])
            }
        });

    }
    //lógica para un usuario profesor
    else if (dominio == "profesor.duoc.cl") {
        const query = `select * from profesor where correo="${username}" and password="${password}";`
        connection.query(query, function (error, results, fields) {
            if (error) {
                res.status(500).send("db_error")
            }
            if (results.length == 0) {
                console.log("invalid credentials");
                res.status(400).send("invalid credentials")
            } else {
                results[0].password = null
                res.send(results[0])
            }
        });
    } else {
        console.log("invalid domain");
        res.status(400).send("invalid domain")
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

//lógica para ver la lista de alumnos de la sección
app.get('/lista', (req, res) => {
    const correo = req.query.correo
    console.log(correo);
    
    const query = `select 
    a.rut_alumno as "rut",
    CONCAT(a.nombre,' ',a.apellido) as "nombre",
    a.asistente,
    s.nombre_seccion "asignatura",
    a.id_seccion as "seccion",
    CONCAT(p.nombre,' ',p.apellido) as "profesor"
    from alumno a inner join seccion s 
    on (a.id_seccion=s.id_seccion)
    right join profesor p 
    on (s.id_seccion = p.id_seccion) 
    where p.correo = "${correo}"`

    connection.query(query, function (error, results, fields) {
        if (error) {
            res.status(500).send("db_error")
        }
        if (results.length == 0) {
            console.log("correo inexistente");
            res.status(400).send("correo de profesor inexistente")
        } else {
            res.send(results)
        }
    });
})

// ... (código anterior)

app.patch('/asistencia', (req, res) => {
    const rut = req.query.rut;
    console.log(rut);

    const query = `UPDATE alumno
                   SET asistente = 'presente'
                   WHERE rut_alumno = ?`;

    connection.query(query, [rut], function (error, results, fields) {
        if (error) {
            res.status(500).send("db_error");
        } else {
            // Verificar si se realizó la actualización correctamente
            if (results.affectedRows > 0) {
                res.send("Asistencia actualizada correctamente");
            } else {
                res.status(400).send("No se encontró el alumno con el rut proporcionado");
            }
        }
    });
});


// ... (código posterior)
