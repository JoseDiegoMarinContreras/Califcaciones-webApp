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

    $("#btnAddAlumno").on('click', agregarAlumno);
});

function cargarDatosTabla(){
  
  fetchDatAlumnos();
}

function fetchDatAlumnos(){
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const url = "https://app-calificaciones.herokuapp.com/plf/alumnos";
  fetch(proxyurl+url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
          })
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
    fetch(proxyurl+url, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              }
            })
      .then(response => response.json())
      .then((dataAlumnosJson) => {
        operacion(dataAlumnosJson[0])
      });
  }
}

function obtenerPromedio(){
  operacionAlAlumno((alumno) => {
    let val = `<ul class="list-group">
                  <li class="list-group-item active">Promdeio del alumno ${alumno.Nombres} ${alumno.Apellidos}</li>`;

    let promedio = _.reduce(alumno.Materias, function(sum, materia) {
      val += `<li class="list-group-item"><div style="float: left!important;"><strong>Materia:</strong> ${materia.Nombre_Materia}, <strong>Calificacion:</strong> ${materia.Calificacion}</div></li>`;
      return sum + (materia.Calificacion/alumno.Materias.length);
    }, 0);
    val += `<li class="list-group-item"><div style="float: left!important;"><strong>Promedio:</strong> ${promedio}</div></li></ul>`;

    Swal({
      title: '<strong>Datos</strong>',
      type: 'info',
      width: 600,
      html: val,
      showCloseButton: true,
    });

  });
}

function agregarMateria(){

  operacionAlAlumno((alumno) => {
    let form = `
    <div class="form-group">
      <label style="float: left!important;"><strong>Clave de la materia</strong></label>
      <input type="text" class="form-control" id="frmClvMat" placeholder="Ingresar clave de materia">
    </div>

    <div class="form-group">
      <label style="float: left!important;"><strong>Nombre de la materia</strong></label>
      <input type="text" class="form-control" id="frmNmbMat" placeholder="Ingresar nombre de la materia">
    </div>

    <div class="form-group">
      <label style="float: left!important;"><strong>Calificacion</strong></label>
      <input type="number" class="form-control" id="frmClfMat" placeholder="Ingresar calificacion de la materia">
    </div>

    <div style="width: 100%; background: #FF0000;">
      <p id="msjErrFormMat" style="color: #FFFFFF;"></p>
    </div>
    `;

    Swal({
      title: '<strong>Agregar Materia</strong>',
      type: 'question',
      width: 600,
      html: form,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showConfirmButton: true,
      cancelButtonText: "Cancelar"
    }).then((resultado) => {
      if(resultado.value){
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const url = "https://app-calificaciones.herokuapp.com/plf/alumnos";
        const json = {
          Codigo_Materia: $("#frmClvMat").val(),
          Nombre_Materia: $("#frmNmbMat").val(),
          Calificacion: $("#frmClfMat").val()
        };

        console.log(JSON.stringify(json));

        fetch(proxyurl+url+`/${alumno.No_Control}`, {
                  body: JSON.stringify(json),
                  method: "PUT",
                  headers: {
                      "Content-Type": "application/json",
                  },
              }).then((response) => {
                console.log(response);
                cargarDatosTabla();
              });

      }
    });
  });
}

function agregarAlumno(){
  let form = `
  <div class="form-group">
    <label style="float: left!important;">Numero de control</label>
    <input type="text" class="form-control" id="frmNoCtrl" placeholder="Ingresar numero de control">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Nombre del alumno</label>
    <input type="text" class="form-control" id="frmNombAlm" placeholder="Ingresar nombre">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Apellidos</label>
    <input type="tel" class="form-control" id="frmApellidos" placeholder="Ingresar apellidos">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Numero telefonico</label>
    <input type="cellphone" class="form-control" id="frmTelefono" placeholder="Ingresar Telefono">
  </div>

  <div style="width: 100%; background: #FF0000;">
    <p id="msjErrFormAlm" style="color: #FFFFFF;"></p>
  </div>
  `;

  Swal({
    title: '<strong>Agregar Alumno</strong>',
    type: 'question',
    html: form,
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    showConfirmButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: () => validarFormAddAlumno()
  }).then((resultado) => {
    if(resultado.value){
      const proxyurl = "https://cors-anywhere.herokuapp.com/";
      const url = "https://app-calificaciones.herokuapp.com/plf/alumnos";
      const json = {
        No_Control: $("#frmNoCtrl").val(),
        Nombres: $("#frmNombAlm").val(),
        Apellidos: $("#frmApellidos").val(),
        Telefono: $("#frmTelefono").val()
      };

      console.log(JSON.stringify(json));

      fetch(proxyurl+url, {
                body: JSON.stringify(json),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((response) => {
              console.log(response);
              cargarDatosTabla();
            });
    }
  });
}


function validarFormAddAlumno(){
  let noCtrl =  $("#frmNoCtrl").val();
  let nombAlm = $("#frmNombAlm").val();
  let apellidos = $("#frmApellidos").val();
  let telefono = $("#frmTelefono").val();
  let msjErr = "";

  if(noCtrl == "" || isNaN(Number(noCtrl))){
    msjErr += "<li><div class='float-left'>Numero de control.</div></li>";
  }
  if(nombAlm == ""){
    msjErr += "<li><div class='float-left'>Nombres.</div></li>";
  }
  if(apellidos == ""){
    msjErr += "<li><div class='float-left'>Apellidos.</div></li>";
  }
  if(telefono == "" || isNaN(Number(telefono))){
    msjErr += "<li><div class='float-left'>Numero de telefono.</div></li>";
  }

  if(msjErr == ""){
    return true;
  }else{

    $("#msjErrFormAlm").html(`<strong>Los siguientes campos son requeridos o son erroneos:<br><ul>${msjErr}</ul></strong>`);
    return false;
  }
}

function validarFormAddMateria(){
  let claveMat =  $("#frmClvMat").val();
  let nombreMat = $("#frmNmbMat").val();
  let calificacionMat = $("#frmClfMat").val();
  let msjErr = "";

  if(claveMat == ""){
    msjErr += "<li><div class='float-left'>Clave de materia.</div></li>";
  }
  if(nombreMat == ""){
    msjErr += "<li><div class='float-left'>Nombre de la materia.</div></li>";
  }
  if(calificacionMat == ""){
    msjErr += "<li><div class='float-left'>Calificacion de la materia.</div></li>";
  }

  if(msjErr == ""){
    return true;
  }else{
    $("#msjErrFormMat").html(`<strong>Los siguientes campos son requeridos o son erroneos:<br><ul>${msjErr}</ul></strong>`);
    return false;
  }
}
