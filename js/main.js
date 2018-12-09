var dataAlumnos = [
    {
        No_Control: 14400961,
        Nombres: "Jose Diego",
        Apellidos: "Marin Contreras",
        Telefono: "311-847-10-47",
        Materias: [
            {
                Codigo_Materia: "SCC-1019",
                Nombre_Materia: "Programacion logica y funcional",
                Calificacion: 90
            },
            {
                Codigo_Materia: "SCP-1012",
                Nombre_Materia: "Aplicaciones empresariales",
                Calificacion: 91
            }
        ]
    },
    {
        No_Control: 14400365,
        Nombres: "Agustin",
        Apellidos: "Barajas Valdivia",
        Telefono: "322-156-82-96",
        Materias: [
            {
                Codigo_Materia: "SCC-1019",
                Nombre_Materia: "Programacion logica y funcional",
                Calificacion: 93
            },
            {
                Codigo_Materia: "SCP-1012",
                Nombre_Materia: "Aplicaciones empresariales",
                Calificacion: 95
            }
        ]
    },
    {
        No_Control: 14400119,
        Nombres: "Irving Yair",
        Apellidos: "Nava Hernandez",
        Telefono: "311-174-25-19",
        Materias: [
            {
                Codigo_Materia: "ACF-0904",
                Nombre_Materia: "Calculo Vectorial",
                Calificacion: 80
            },
            {
                Codigo_Materia: "SCP-1010",
                Nombre_Materia: "NoSQL",
                Calificacion: 94
            },
            {
                Codigo_Materia: "SCC-1019",
                Nombre_Materia: "Programacion logica y funcional",
                Calificacion: 92
            },
            {
                Codigo_Materia: "SCC-1013",
                Nombre_Materia: "Investigacion de operaciones",
                Calificacion: 70
            }
        ]
    },
    {
        No_Control: 14400666,
        Nombres: "Hector Ivan",
        Apellidos: "Herrera Barragan",
        Telefono: "311-169-34-53",
        Materias: [
            {
                Codigo_Materia: "SCP-1666",
                Nombre_Materia: "Aplicaciones multiplataforma",
                Calificacion: 81
            },
            {
                Codigo_Materia: "SCD-1021",
                Nombre_Materia: "Redes de computadora",
                Calificacion: 77
            },
            {
                Codigo_Materia: "SCP-1010",
                Nombre_Materia: "NoSQL",
                Calificacion: 100
            },
            {
                Codigo_Materia: "SCA-1026",
                Nombre_Materia: "Taller de sistemas operativos",
                Calificacion: 100
            },
            {
                Codigo_Materia: "SCC-1019",
                Nombre_Materia: "Programacion logica y funcional",
                Calificacion: 90
            }
        ]
    }
];

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosTabla();
});

function cargarDatosTabla(){
    fetchDatAlumnos();
}
function fetchDatAlumnos(){
    //fetch("URL")
    //    .then(response => response.json())
    //        .the((dataAlumnos) => {
                procesarDatosAlumnos(dataAlumnos)
    //        });
}
function procesarDatosAlumnos(rawDataAlumns){
    let alumnosResult=[];
    _.forEach(rawDataAlumns, function(alumno){
        _.map(alumno.Materias, function(materia){
            let wrapped = _(alumnosResult).push({
                NoControl: alumno.No_Control,
                NombCompleto: alumno.Apellidos + " " + alumno.Nombres,
                Materia: materia.Nombre_Materia,
                Calificacion: materia.Calificacion
            });
            wrapped.commit();
        });
    });
    insertDatosTablaAlmns(alumnosResult)
    console.log(alumnosResult);
}
function insertDatosTablaAlmns(dataAlumns){
    _.forEach(dataAlumns, function(alumno){
        $("#tablaCalf tbody").append(`<tr>
            <td>${alumno.NoControl}</td>
            <td>${alumno.NombCompleto}</td>
            <td>${alumno.Materia}</td>
            <td>${alumno.Calificacion}</td>
        </tr>`);
    });
}