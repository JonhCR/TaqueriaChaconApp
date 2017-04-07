// Inicializa la aplicacion
var myApp = new Framework7({
            material : true, //Activa el tema de material css en framework7
        });

// Si necesito usar Libreria personalizada del DOM se salva en $$
var $$ = Dom7;

// Añade una vista
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true //Inicializa la vista con navbar dinamica
});

// Maneja el evento de cordova de dispositivo listo
$$(document).on('deviceready', function() {
    console.log("El dispositivo está listo");
});


//Funcion anonima al cargarse la pantalla de registro
myApp.onPageInit('register', function (page) {

    // Metodo submit del formulario 
    $( "#registrarClienteForm" ).submit(function( event ) {
      
      // Previene el submit normal y salto de pantalla
      event.preventDefault();
      
      // Obtiene los datos del formulario
      var $form = $( this ),
        name = $form.find( "input[name='name']" ).val(),
        email = $form.find( "input[name='email']" ).val(),
        password = $form.find( "input[name='password']" ).val(),
        cedula = $form.find( "input[name='cedula']" ).val(),
        telefono = $form.find( "input[name='telefono']" ).val(),
        fecha_nacimiento = $form.find( "input[name='fecha_nacimiento']" ).val(),
        domicilio = $form.find( "input[name='domicilio']" ).val(),
        url = $form.attr( "action" );

      //Muestra el preloader al inciar el proceso
      myApp.showPreloader('Registrando...');
       
      // Envía la solicitud al servidor , serializa a json los datos
      var posting = $.post( url, { name : name , email:email , password:password ,
      cedula:cedula , telefono:telefono , fecha_nacimiento:fecha_nacimiento , 
      domicilio:domicilio } )
     
        //Si la respuesta del servidor fue satisfactoria
       .done(function( data ) {

        myApp.hidePreloader(); //Esconde el preloader

        //Si el estado fue exitoso (Registro completo)
        if (data.status == 'success') {
            myApp.alert(data.message , 'Correcto');
        }
        
        //Si el estado fue fallido (Email o telefono repetido)
        if (data.status == 'fail') {
            myApp.alert(data.message , 'Error');
        }

      })//end .done

       //Si la solicitud al servidor fue erronea
      .fail(function() {

        myApp.hidePreloader(); //Esconde el preloader

        //Muestra una alerta
        myApp.alert('Ha ocurrido un error al contactar al servidor' , 'Sin conexión');
      }); //End .fail
      

    }); //End evento on submit del formulario

}) // End vista de registro
