var dataTablaAlumnos;
var operacionAlAlumno;

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosTabla();

    //=============== CONFIGURACION DE CONTEXT MENU ===============
    $.contextMenu({
      selector: '.context-menu-one',
      items: {
        key: {
          name: "Consultar materias del alumno",
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
                text: 'Seleccione un filtro válido'
            });
        }else{
            filtrarDatos(dataTablaAlumnos, opcion, $("#valorFiltro").val());
        }
    };

    //=============== EVENTO BOTÓN FILTRAR ===============
    $("#btnFiltrar").on('click', realizarBusqueda);
    $("#valorFiltro").on('keyup', (evt) => {
        if(evt.which == 13){
            realizarBusqueda();
        }
    });

    //=============== EVENTO BOTÓN AGREGAR ALUMNO ===============
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
    //=============== MÉTODO MAP ===============
    _.map(rawDataAlumns, function(alumno){
      let wrapped = _(dataTablaAlumnos).push({
        No_Control: alumno.No_Control,
        NombreCompleto: alumno.Apellidos + " " + alumno.Nombres,
        Telefono: alumno.Telefono,
        //=============== MÉTODO REDUCE ===============
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
    //=============== MÉTODO FILTER ===============
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
                  <li class="list-group-item active">Alumno: ${alumno.Nombres} ${alumno.Apellidos}</li>`;
    //=============== MÉTODO REDUCE ===============
    let promedio = _.reduce(alumno.Materias, function(sum, materia) {
      val += `<li class="list-group-item"><div style="float: left!important;"><strong>Materia:</strong> ${materia.Nombre_Materia}, <strong>Calificación:</strong> ${materia.Calificacion}</div></li>`;
      return sum + (materia.Calificacion/alumno.Materias.length);
    }, 0);
    val += `<li class="list-group-item"><div style="float: left!important;"><strong>Promedio:</strong> ${promedio}</div></li></ul>`;

    Swal({
      title: '<strong>Materias Asignadas</strong>',
      imageUrl:'http://euchems-seville2016.eu/wp-content/uploads/2015/09/registro.png',
      imageWidth: 117,
      imageHeight: 117,
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
      <label style="float: left!important;"><strong>Clave</strong></label>
      <input type="text" class="form-control" id="frmClvMat" placeholder="Ingresar clave de materia">
    </div>

    <div class="form-group">
      <label style="float: left!important;"><strong>Nombre</strong></label>
      <input type="text" class="form-control" id="frmNmbMat" placeholder="Ingresar nombre de la materia">
    </div>

    <div class="form-group">
      <label style="float: left!important;"><strong>Calificación</strong></label>
      <input type="number" class="form-control" id="frmClfMat" placeholder="Ingresar calificación de la materia">
    </div>

    <div style="width: 100%; background: #FF0000;">
      <p id="msjErrFormMat" style="color: #FFFFFF;"></p>
    </div>
    `;

    Swal({
      title: '<strong>Datos de la Materia</strong>',
      width: 600,
      html: form,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showConfirmButton: true,
      cancelButtonText: "Cancelar",
      imageUrl:'http://euchems-seville2016.eu/wp-content/uploads/2015/09/registro.png',
      imageWidth: 117,
      imageHeight: 117,
      preConfirm: () => validarFormAddMateria()
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
        Swal({
          position: 'center',
          type: 'success',
          title: 'Materia registrada con éxito',
          showConfirmButton: false,
          timer: 1700
        })
      }
    });
  });
}

function agregarAlumno(){
  let form = `
  <div class="form-group">
    <label style="float: left!important;">Número de control</label>
    <input type="number" class="form-control" id="frmNoCtrl" placeholder="Ingresar número de control">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Nombre</label>
    <input type="text" class="form-control" id="frmNombAlm" placeholder="Ingresar nombre">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Apellidos</label>
    <input type="text" class="form-control" id="frmApellidos" placeholder="Ingresar apellidos">
  </div>

  <div class="form-group">
    <label style="float: left!important;">Número telefónico</label>
    <input type="cellphone" class="form-control" id="frmTelefono" placeholder="Ingresar Teléfono">
  </div>

  <div style="width: 100%; background: #FF0000;">
    <p id="msjErrFormAlm" style="color: #FFFFFF;"></p>
  </div>
  `;

  Swal({
    title: '<strong>Datos del Alumno</strong>',
    //type: 'question',
    html: form,
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    showConfirmButton: true,
    cancelButtonText: "Cancelar",
    imageUrl:'http://psicosaludmendoza.com.ar/formacion/wp-content/uploads/2017/05/entradas.png',
    imageWidth: 117,
    imageHeight: 117,
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
      Swal({
        position: 'center',
        type: 'success',
        title: 'Alumno registrado con éxito',
        showConfirmButton: false,
        timer: 1700
      })
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
    msjErr += "<li><div class='float-left'>Número de control.</div></li>";
  }
  if(nombAlm == ""){
    msjErr += "<li><div class='float-left'>Nombres.</div></li>";
  }
  if(apellidos == ""){
    msjErr += "<li><div class='float-left'>Apellidos.</div></li>";
  }
  if(telefono == "" || isNaN(Number(telefono))){
    msjErr += "<li><div class='float-left'>Número de teléfono.</div></li>";
  }

  if(msjErr == ""){
    return true;
  }else{

    $("#msjErrFormAlm").html(`<strong>Los siguientes campos son requeridos o son erróneos:<br><ul>${msjErr}</ul></strong>`);
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
    msjErr += "<li><div class='float-left'>Calificación de la materia.</div></li>";
  }
  if(msjErr == ""){
    return true;
  }else{
    $("#msjErrFormMat").html(`<strong>Los siguientes campos son requeridos o son erróneos:<br><ul>${msjErr}</ul></strong>`);
    return false;
  }
}
