var dataTablaAlumnos;

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosTabla();

    //=============== EVENTOS ===============
    let realizarBusqueda = () => {
        let opcion = $("#cmbTipFiltro").val();
        if(opcion == 0){
            Swal({
                type: 'error',
                title: 'Error',
                text: 'Opcion de filtro no permitido'
            });
        }else{
            filtrarDatos(dataTablaAlumnos, opcion, $("#valorFiltro").val());
        }
    };

    $("#btnFiltrar").on('click', realizarBusqueda);
    $("#valorFiltro").on('keyup', (evt) => {
        if(evt.which == 13){
            realizarBusqueda();
        }
    });
});

function cargarDatosTabla(){
    fetchDatAlumnos();
}

function fetchDatAlumnos(){
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const url = "https://app-calificaciones.herokuapp.com/plf/alumnos";
  fetch(proxyurl+url)
        .then(response => response.json())
            .then((dataAlumnosJson) => procesarDatosAlumnos(dataAlumnosJson));
}

function procesarDatosAlumnos(rawDataAlumns){
    dataTablaAlumnos=[];
    _.forEach(rawDataAlumns, function(alumno){
        _.map(alumno.Materias, function(materia){
            let wrapped = _(dataTablaAlumnos).push({
                No_Control: alumno.No_Control,
                NombreCompleto: alumno.Apellidos + " " + alumno.Nombres,
                Nombre_Materia: materia.Nombre_Materia,
                Calificacion: materia.Calificacion
            });
            wrapped.commit();
        });
    });
    insertDatosTablaAlmns(dataTablaAlumnos);
}

function insertDatosTablaAlmns(dataAlumns){
    let cuerpoTabla = $("#tablaCalf tbody");
    cuerpoTabla.html("");
    _.forEach(dataAlumns, function(alumno){
        cuerpoTabla.append(`<tr>
            <td>${alumno.No_Control}</td>
            <td>${alumno.NombreCompleto}</td>
            <td>${alumno.Nombre_Materia}</td>
            <td>${alumno.Calificacion}</td>
        </tr>`);
    });
}

function filtrarDatos(data, filtro, valorFiltro){
    insertDatosTablaAlmns(_.filter(data, (alumno) => String(alumno[filtro]).toLowerCase().includes(valorFiltro.toLowerCase())));
}
