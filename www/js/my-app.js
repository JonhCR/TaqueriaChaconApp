var storage = window.localStorage;

// Inicializa la aplicacion
var myApp = new Framework7({
            material : true, //Activa el tema de material css en framework7
           // pushState: true, // El back button lo manejo manual , por eso comentado
            modalButtonOk : 'Ok' , // Ok button del modal
            modalButtonCancel : 'Cancelar', // Cancel buttom del modal
        });

// Si necesito usar Libreria personalizada del DOM se salva en $$
var $$ = Dom7;

// Añade una vista
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: false //Inicializa la vista sin navbar dinamica
});


// Maneja el evento de cordova de dispositivo listo
$$(document).on('deviceready', function() {
   
    var token = storage.getItem('token'); // Obtiene el token en el telefono

    //Si el dispositivo no tiene un token de autenticacion
    if(typeof token == null || !token || token == 'null' ){
          mainView.router.loadPage("login.html");
    }
    else{
      //Determina si el token aun sigue siendo valido en el servidor
      if( !userAuthenticated() ){
          mainView.router.loadPage("login.html");
      }
    }

    console.log("El dispositivo está listo");
});

myApp.onPageInit('index' , function(page){

    
    //Onclick de cerrar sesion
    //Invalida el token en el servidor
    //Destruye el token en storage del telefono
    $('#logout_btn').click( function(){
                myApp.confirm('¿Cerrar Sesion?', 'El chacolin colorado', 
                  function () {
                      myApp.showPreloader('Finalizando...');
                      $.get( "http://demosolutionscrc.ga/api/cliente/logout?token="+storage.getItem('token'))
                        .done(function(data) {
                          myApp.hidePreloader(); // Esconde el preloader
                          storage.setItem('token', null); // Elimina el token de autenticacion
                          mainView.router.loadPage("login.html");
                        })
                        .fail(function() {
                          myApp.hidePreloader(); // Esconde el preloader
                          myApp.alert('Ha ocurrido un error , vuelve a intentarlo' , 'Error');
                        });
                  },
                  function () {
                       console.log("Cancelo cerrar sesion");
                  }
                );
    });

});

//Vista de autenticacion 
myApp.onPageInit('login' , function(page){
        
        //Onclick al formulario de login
        //Crea un token de autenticacion en el servidor
        //Crea un token de autenticacion en el telefono
        $('#logearClienteForm').submit(function( event ){

            event.preventDefault();
            
            // Obtiene los datos del formulario
            var $form = $( this ),
            email = $form.find( "input[name='email']" ).val(),
            password = $form.find( "input[name='password']" ).val(),
            url = $form.attr( "action" );

            //Muestra el preloader al inciar el proceso
            myApp.showPreloader('Iniciando...');

             // Envía la solicitud al servidor , serializa a json los datos
              var posting = $.post( url, { email:email , password:password } )
             
                //Si la respuesta del servidor fue satisfactoria
               .done(function( data ) {
                storage.setItem('token', data.token) // Almacena el token de seguridad
                myApp.hidePreloader(); //Esconde el preloader
                mainView.router.loadPage("index.html");
              })//end .done

               //Si la solicitud al servidor fue erronea
              .fail(function() {
                myApp.alert('Tus credenciales son incorrectas' , 'Error');
                myApp.hidePreloader(); //Esconde el preloader
              }); //End .fail
        });
});

//Step 1  de pedidos , utiliza una funciona anonima para
//traerse los datos del cliente y el menu de la taqueria
myApp.onPageInit('pedidos', function (page) {

    var cliente = null ; // Conserva los datos del cliente

    //Inicializador del swipper
    var swiPedidos = new Swiper('.swip-pedidos', {
        pagination: '.swiper-pagination',
        effect: 'fade',
        speed : 1000,
        onlyExternal: true,
        autoHeight : true,
    });

    //Carga la informacion del usuario
    //Llena los selects del menú
    (function(){ 

        $.ajax({
          url: "http://demosolutionscrc.ga/api/cliente/pedidos?token="+storage.getItem('token'),
          async: false,
        })

         .done(function(data) {
           
            var menus = data.menu;
            cliente = data.cliente;
            for ( i in menus) {       

                            if (menus[i].categoria == 'Comidas') {

                                myApp.smartSelectAddOption('#selector_comidas', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://demosolutionscrc.ga"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +menus[i].nombre
                                +"</option>");

                            }

                            if (menus[i].categoria == 'Bebidas') {

                                myApp.smartSelectAddOption('#selector_bebidas', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://demosolutionscrc.ga"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +menus[i].nombre
                                +"</option>");

                            }

                            if (menus[i].categoria == 'Postres') {

                                myApp.smartSelectAddOption('#selector_postres', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://demosolutionscrc.ga"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +menus[i].nombre
                                +"</option>");

                            }
                             
            } // End for
           
         })

         .fail(function() {
           myApp.alert('Error al cargar la informacion del usuario' , 'Fallo conexión');
         });
                
    })();

    //Boton de cancelacion en el primer layout de pedidos
    $('.pedidos_cancelar').click(function(){
        mainView.router.back();
    });

     //Etapa 2 de la solicitud de pedidos , valida que se seleccione almenos un item antes de continuar
     //En caso de proseguir setea los datos del usuario
    $('.pedidos_verificar_entrega').click(function(){

        if( $('#selector_comidas')[0].selectedOptions.length == 0 &&
            $('#selector_bebidas')[0].selectedOptions.length == 0 &&
            $('#selector_postres')[0].selectedOptions.length == 0  ){
            myApp.alert('Debes seleccionar almenos una comida , bebida o postre en tu pedido' , 'Campos Vacíos');
        }else{
            $('#input_pedido_nombre').val(cliente.name);
            $('#input_pedido_telefono').val(cliente.telefono);
            $('#input_pedido_direccion').val(cliente.domicilio);
            swiPedidos.slideNext();
        }
       
    });

    //Etapa 3 de la solicitud de pedidos , Verifica informacio de entrega 
    //valida que los campos de telefono , nombre y direccion esten rellenos
    //antes de continuar , seguidamente setea la informacion de compra al cliente
    $('.pedidos_listar_detalles').click(function(){
          if( $.trim( $('#input_pedido_nombre').val() ).length == 0 ||
              $.trim( $('#input_pedido_telefono').val() ).length == 0 ||
              $.trim( $('#input_pedido_direccion').val() ).length == 0 )
          {
            myApp.alert('Necesitamos almenos tres datos: tu nombre , telefono y direccion.' , 'Campos Vacíos');
          }else{
              
              $('#input_dueño_nombre').val(cliente.name); //Setea al dueño de la tarjeta default
              var total = 0;// total por pagar
              $('#detalles_items ul li').remove();// Limpia las listas
              
              for (var i = 0; i < $('#selector_comidas')[0].selectedOptions.length; i++) {
                $("#detalles_items ul").append('<li class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">play</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title">'+$('#selector_comidas')[0].selectedOptions[i].label+'</div>'
                  +'<div class="item-after">₡ '+$('#selector_comidas')[0].selectedOptions[i].title+'</div>'
                  +'</div>'
                  +'</li>');
                  total = total + parseFloat($('#selector_comidas')[0].selectedOptions[i].title);
              }

              for (var i = 0; i < $('#selector_bebidas')[0].selectedOptions.length; i++) {
                $("#detalles_items ul").append('<li class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">play</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title">'+$('#selector_bebidas')[0].selectedOptions[i].label+'</div>'
                  +'<div class="item-after">₡ '+$('#selector_bebidas')[0].selectedOptions[i].title+'</div>'
                  +'</div>'
                  +'</li>');
                total = total + parseFloat($('#selector_bebidas')[0].selectedOptions[i].title);
              }

              for (var i = 0; i < $('#selector_postres')[0].selectedOptions.length; i++) {
                $("#detalles_items ul").append('<li class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">play</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title">'+$('#selector_postres')[0].selectedOptions[i].label+'</div>'
                  +'<div class="item-after">₡ '+$('#selector_postres')[0].selectedOptions[i].title+'</div>'
                  +'</div>'
                  +'</li>');
                total = total + parseFloat($('#selector_postres')[0].selectedOptions[i].title);
              }

              $("#detalles_items ul").append('<li style="background-color: rgb(245, 247, 219);" class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">bag</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title"></div>'
                  +'<div style="color: #9e9605;font-weight: 800;" class="item-after">Total : ₡ '+total+'</div>'
                  +'</div>'
                  +'</li>');

            //  

            swiPedidos.slideNext();
          }

    });

    //Escucha del selector de los radios sobre el metodo de pago
    $('input:radio[name="payment_method"]').change(
    function(){
        if ($(this).is(':checked') && $(this).val() == 'Tarjeta') {
            $('.card_efectivo').css("display", "none");
            $('.card_tarjeta').css("display", "block");
        }else{
            $('.card_efectivo').css("display", "block");
            $('.card_tarjeta').css("display", "none");
        }
        swiPedidos.update();
    });

    //Controles del swipper back
    $('.pedidos_back').click(function(){
         swiPedidos.slidePrev()
    });

}) // End vista de pedidos

//Carga la vista para un nuevo registro
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
            //Lo traslada a login layout
            mainView.router.loadPage("login.html");
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


/**
 * Valida si el usuario tiene una session activa
 * @return boolean
 */
function userAuthenticated(){

   var auth = false;

       $.ajax({
          url: "http://demosolutionscrc.ga/api/cliente/check/auth?token="+storage.getItem('token'),
          async: false,
        })
         .done(function(data) {
           console.log(data.session_msg);
           auth = data.session_status;
         })
         .fail(function() {
           auth = false;
         });

    return auth;
}
