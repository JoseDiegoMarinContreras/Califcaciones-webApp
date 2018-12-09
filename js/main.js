var dataTablaAlumnos;
var operacionAlAlumno;

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosTabla();

    //=============== CONFIGURACION DE CONTEXT MENU ===============
    $.contextMenu({
      selector: '.context-menu-one',
      items: {
        key: {
          name: "Promedio del alumno",
          callback: obtenerPromedio
        },
        key2: {
            name: "Agregar materia al alumno",
            callback: agregarMateria
          },
      },
      events: {
        show: function(opt){
          operacionAlAlumno = crearFn(this);
        }
      }
    });

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

    _.map(rawDataAlumns, function(alumno){
      let wrapped = _(dataTablaAlumnos).push({
        No_Control: alumno.No_Control,
        NombreCompleto: alumno.Apellidos + " " + alumno.Nombres,
        Telefono: alumno.Telefono,
        Promedio: _.reduce(alumno.Materias, (sum, materia) => sum + (materia.Calificacion/alumno.Materias.length), 0)
      });
      wrapped.commit();
    });
    insertDatosTablaAlmns(dataTablaAlumnos);
}

function insertDatosTablaAlmns(dataAlumns){
    let cuerpoTabla = $("#tablaCalf tbody");
    cuerpoTabla.html("");
    _.forEach(dataAlumns, function(alumno){
        cuerpoTabla.append(`<tr class="context-menu-one">
            <td>${alumno.No_Control}</td>
            <td>${alumno.NombreCompleto}</td>
            <td>${alumno.Telefono}</td>
            <td>${alumno.Promedio}</td>
        </tr>`);
    });
}

function filtrarDatos(data, filtro, valorFiltro){
    insertDatosTablaAlmns(_.filter(data, (alumno) => String(alumno[filtro]).toLowerCase().includes(valorFiltro.toLowerCase())));
}

function crearFn(elemento){
  let noControl = $($(elemento).children()[0]).html();
  return function(operacion){
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const url = `https://app-calificaciones.herokuapp.com/plf/alumnos/${noControl}`;
    fetch(proxyurl+url)
      .then(response => response.json())
      .then((dataAlumnosJson) => {
        operacion(dataAlumnosJson[0])
      });
  }
}

function obtenerPromedio(){
  operacionAlAlumno((alumno) => {
    console.log(alumno);
    let val = `<ul class="list-group">
                  <li class="list-group-item active">Promdeio del alumno ${alumno.Nombres} ${alumno.Apellidos}</li>`;

    let promedio = _.reduce(alumno.Materias, function(sum, materia) {
      val += `<li class="list-group-item"><strong>Materia:</strong> ${materia.Nombre_Materia}, <strong>Calificacion:</strong> ${materia.Calificacion}</li>`;
      return sum + (materia.Calificacion/alumno.Materias.length);
    }, 0);
    val += `<li class="list-group-item"><strong>Promedio:</strong> ${promedio}</li></ul>`;

    Swal({
      title: '<strong>Datos</strong>',
      type: 'info',
      html: val,
      showCloseButton: true,
    });

  });
}

function agregarMateria(){
  operacionAlAlumno
}
