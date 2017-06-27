var storage = window.localStorage;

// Inicializa la aplicacion
var myApp = new Framework7({
            material : true, //Activa el tema de material css en framework7
            pushState: false, // El back button lo manejo manual 
            modalButtonOk : 'Ok' , // Ok button del modal
            modalButtonCancel : 'Cancelar', // Cancel buttom del modal
            popupCloseByOutside:false, // Evita cerrar los pops
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
          $('.session_header_status').html( "<i class='f7-icons'>close</i>  No conectado" );
          $('.session_panel_options_user').hide(); //Panel right for user hidded
          $('.session_bottom_toolbars_user').hide(); //Toolbar buttoms for user hidded
          $('.session_panel_options_guess').show();  //Panel right for guess showed
          $('.session_bottom_toolbars_guess').show(); //Toolbar buttoms for guess showed
    }
    else{
      //Determina si el token aun sigue siendo valido en el servidor
      if( !userAuthenticated() ){

          $('.session_header_status').html( "<i class='f7-icons'>close</i>  No conectado" );
          $('.session_panel_options_user').hide(); //Panel right for user hidded
          $('.session_bottom_toolbars_user').hide(); //Toolbar buttoms for user hidded
          $('.session_panel_options_guess').show();  //Panel right for guess showed
          $('.session_bottom_toolbars_guess').show(); //Toolbar buttoms for guess showed
      }
      //El token existe y todavia es valido
      else{
          $('.session_header_status').html( "<b> <i class='f7-icons'>person</i>  Jhon Moreira </b>" );
          $('.session_panel_options_user').show(); //Panel right for user showed
          $('.session_bottom_toolbars_user').show(); //Toolbar buttoms for user showed
          $('.session_panel_options_guess').hide();  //Panel right for guess hidded
          $('.session_bottom_toolbars_guess').hide(); //Toolbar buttoms for guess hidded
      }
    }

    console.log("El dispositivo está listo");
});

myApp.onPageInit('index' , function(page){

    var token = storage.getItem('token'); // Obtiene el token en el telefono

    //Si el dispositivo no tiene un token de autenticacion
    if(typeof token == null || !token || token == 'null' ){
          $('.session_header_status').html( "<i class='f7-icons'>close</i>  No conectado" );
          $('.session_panel_options_user').hide(); //Panel right for user hidded
          $('.session_bottom_toolbars_user').hide(); //Toolbar buttoms for user hidded
          $('.session_panel_options_guess').show();  //Panel right for guess showed
          $('.session_bottom_toolbars_guess').show(); //Toolbar buttoms for guess showed
    }
    else{
      //Determina si el token aun sigue siendo valido en el servidor
      if( !userAuthenticated() ){

          $('.session_header_status').html( "<i class='f7-icons'>close</i>  No conectado" );
          $('.session_panel_options_user').hide(); //Panel right for user hidded
          $('.session_bottom_toolbars_user').hide(); //Toolbar buttoms for user hidded
          $('.session_panel_options_guess').show();  //Panel right for guess showed
          $('.session_bottom_toolbars_guess').show(); //Toolbar buttoms for guess showed
      }
      //El token existe y todavia es valido
      else{
          $('.session_header_status').html( "<b> <i class='f7-icons'>person</i>  Jhon Moreira </b>" );
          $('.session_panel_options_user').show(); //Panel right for user showed
          $('.session_bottom_toolbars_user').show(); //Toolbar buttoms for user showed
          $('.session_panel_options_guess').hide();  //Panel right for guess hidded
          $('.session_bottom_toolbars_guess').hide(); //Toolbar buttoms for guess hidded
      }
    }
    
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

    var form_pedidos = new FormData();
    var menu_escogido = []; //Arreglo de objetos con los menus escogidos en este pedido
    var pedido_info_entrega = [];// Arreglo de objetos con la informacion de entrega
    var pedido_detalle_pago = [];// Arreglo de objetos con la informacion de pago
    var pedido_total // Mantiene el total de pagar en este pedido
    var cliente = null ; // Conserva los datos del cliente
    

    //Inicializador del swipper
    var swiPedidos = new Swiper('.swip-pedidos', {
        pagination: '.swiper-pagination',
        effect: 'fade',
        speed : 1000,
        onlyExternal: true,
        autoHeight : true,
    });

    //Carga obtiene al cliente logueado y carga los select con el menu disponible
    (function(){ 

        $.ajax({
          url: "http://www.taqueriachaconpavas.com/api/cliente/pedidos?token="+storage.getItem('token'),
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
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +menus[i].nombre
                                +"</option>");
                            }
                           if (menus[i].categoria == 'Bebidas') {

                                myApp.smartSelectAddOption('#selector_bebidas', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +menus[i].nombre
                                +"</option>");
                            }
                            if (menus[i].categoria == 'Postres') {

                                myApp.smartSelectAddOption('#selector_postres', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
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

    //Abre una ventan popup en donde en un listview injecta los pedidos
    //Crea botones con ids listener para poder reaccionar y eliminar elementos
    $('.abrir-carrito').click(function(){

        $('#ul-carrito li').remove(); //Limpia las listas del carrito

        for (var i = 0, l = menu_escogido.length; i < l; i++) {

             var menu = menu_escogido[i];

             $("#ul-carrito").append('<li class="item-content" >'
             +'<div class="item-media">'
             +'<a id="'+menu.menu_id+'" href="#" class="button carrito-eliminar-btn"><i class="f7-icons">close_round_fill</i></a></div>'
             +'<div class="item-inner">'
             +'<div class="item-title"> ('+menu.cantidad+') '+ menu.item_nombre+'</div>'
             +'<div class="item-after"> ₡ '+ (menu.cantidad * menu.total) +'</div>'
             +'</div>'
             +'</li>');

        }
        myApp.popup('.popup-abrir-carrito');
    });//Fin abrir carrito

     //Nomenclatura usada para añadir listener a elemntos interactivos
     //Elimina un elemento del objeto menu_escogido 
     //Elimina un elemento del listview
     //Actualiza el carrito
     $('body').on('click', '.carrito-eliminar-btn', function() {
          
          var id = $(this)[0].id ; //id de la comida
          var menu_escogido_actualizado = [] //Creo un objeto actualizado del menu

          //Acualizo el nuevo objeto del menu con todos menos los que coincidan con el
          //id escogido
          for (var i = 0, l = menu_escogido.length; i < l; i++) {
             var menu = menu_escogido[i]; 
             if(menu.menu_id != id ){
                menu_escogido_actualizado.push({
                    menu_id: menu.menu_id,
                    item_nombre: menu.item_nombre,
                    total : menu.total,
                    cantidad : menu.cantidad
                });
             }
          }
          
          menu_escogido = menu_escogido_actualizado; //Guardo en menu escogido

          $('#ul-carrito li').remove(); //Limpia las listas del carrito

          for (var i = 0, l = menu_escogido.length; i < l; i++) {

               var menu = menu_escogido[i];

               $("#ul-carrito").append('<li class="item-content" >'
               +'<div class="item-media">'
               +'<a id="'+menu.menu_id+'" href="#" class="button carrito-eliminar-btn"><i class="f7-icons">close_round_fill</i></a></div>'
               +'<div class="item-inner">'
               +'<div class="item-title"> ('+menu.cantidad+') '+ menu.item_nombre+'</div>'
               +'<div class="item-after"> ₡ '+ (menu.cantidad * menu.total) +'</div>'
               +'</div>'
               +'</li>');

          }

          //Actualizo elementos del carrito
          $('#carrito_cantidad').text( parseInt( $('#carrito_cantidad').text() ) - 1 );

     });// Fin carrito-eliminar-btn

    //Boton de cancelacion en el primer layout de pedidos
    $('.pedidos_cancelar').click(function(){
        mainView.router.back();
    });

    //Boton añade comida al carrito
    $('#add_food_btn').click(function(){
      
      //Smartselect Value = id , text = food name , title = price
      var comida_id = $('.smart-select #selector_comidas')[0].selectedOptions[0].value;
      var comida_texto = $('.smart-select #selector_comidas')[0].selectedOptions[0].text;
      var comida_precio = $('.smart-select #selector_comidas')[0].selectedOptions[0].title;
      var comida_cantidad =  $('#cantidad_comida').val();
   
      if( comida_cantidad > 0){

        //Agrega a la tabla y guarda el nuevo pedido
        menu_escogido.push({
                               menu_id: comida_id,
                               item_nombre: comida_texto,
                               total : comida_precio,
                               cantidad : comida_cantidad
                           });

        //Notifica al usuario
        myApp.addNotification({
          message: comida_texto +' se añadió a tu carrito',
          hold : 5000,
          button :{
                    text: 'cerrar',
                    color: 'green',
                    close: true
                  }
        });

        //Actualiza la cantidad y el carrito
        $('#cantidad_comida').val(0);
        $('#carrito_cantidad').text( parseInt( $('#carrito_cantidad').text() ) + 1 );

      }else{
        myApp.alert('La cantidad debe ser mayor a 0' , comida_texto );
      }

    });

     //Boton añade postres al carrito
    $('#add_desert_btn').click(function(){
      
      //Smartselect Value = id , text = desert name , title = price
      var postre_id = $('.smart-select #selector_postres')[0].selectedOptions[0].value;
      var postre_texto = $('.smart-select #selector_postres')[0].selectedOptions[0].text;
      var postre_precio = $('.smart-select #selector_postres')[0].selectedOptions[0].title;
      var postre_cantidad =  $('#cantidad_postre').val();
   
      if( postre_cantidad > 0){

        //Agrega a la tabla y guarda el nuevo pedido
        menu_escogido.push({
                               menu_id: postre_id,
                               item_nombre: postre_texto,
                               total : postre_precio,
                               cantidad : postre_cantidad
                           });

        //Notifica al usuario
        myApp.addNotification({
          message: postre_texto +' se añadió a tu carrito',
          hold : 5000,
          button :{
                    text: 'cerrar',
                    color: 'green',
                    close: true
                  }
        });

        //Actualiza la cantidad y el carrito
        $('#cantidad_postre').val(0);
        $('#carrito_cantidad').text( parseInt( $('#carrito_cantidad').text() ) + 1 );

      }else{
        myApp.alert('La cantidad debe ser mayor a 0' , postre_texto );
      }

    });

     //Boton añade bebidas al carrito
    $('#add_drink_btn').click(function(){
      
      //Smartselect Value = id , text = drink name , title = price
      var bebida_id = $('.smart-select #selector_bebidas')[0].selectedOptions[0].value;
      var bebida_texto = $('.smart-select #selector_bebidas')[0].selectedOptions[0].text;
      var bebida_precio = $('.smart-select #selector_bebidas')[0].selectedOptions[0].title;
      var bebida_cantidad =  $('#cantidad_bebida').val();
   
      if( bebida_cantidad > 0){

        //Agrega a la tabla y guarda el nuevo pedido
        menu_escogido.push({
                               menu_id: bebida_id,
                               item_nombre: bebida_texto,
                               total : bebida_precio,
                               cantidad : bebida_cantidad
                           });

        //Notifica al usuario
        myApp.addNotification({
          message: bebida_texto +' se añadió a tu carrito',
          hold : 5000,
          button :{
                    text: 'cerrar',
                    color: 'green',
                    close: true
                  }
        });

        //Actualiza la cantidad y el carrito
        $('#cantidad_bebida').val(0);
        $('#carrito_cantidad').text( parseInt( $('#carrito_cantidad').text() ) + 1 );

      }else{
        myApp.alert('La cantidad debe ser mayor a 0' , bebida_texto );
      }

    });

     //Etapa 2 de la solicitud de pedidos , valida que se seleccione almenos un item antes de continuar
     //En caso de proseguir setea los datos del usuario
    $('.pedidos_verificar_entrega').click(function(){

        if( menu_escogido.length == 0  ){
            myApp.alert('Debes seleccionar al menos una comida , bebida o postre en tu pedido' , 'Campos Vacíos');
        }else{
            $('#input_pedido_nombre').val(cliente.name);
            $('#input_pedido_telefono').val(cliente.telefono);
            $('#input_pedido_direccion').val(cliente.domicilio);
            console.log(menu_escogido);
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

              console.log(menu_escogido);

              //Determina si el transporte fue seleccionado
              var transporte = 0; // Asume que no fue chequeado
              if ( $('#input_pedido_transporte').is(':checked') ){
                transporte = 1;
              }

              pedido_info_entrega = []; //Limpio la informacion de entrega para setear una nueva

              //Serializa los datos de informacion de entrega
              pedido_info_entrega.push({
                                        nombre_cliente: $('#input_pedido_nombre').val(),
                                        telefono_cliente: $('#input_pedido_telefono').val(),
                                        direccion_cliente: $('#input_pedido_direccion').val(),
                                        comentario_cliente : $('#input_pedido_comentario').val(),
                                        servicio_express : transporte,
                                    });
              
              $('#input_dueño_nombre').val(cliente.name); //Setea al dueño de la tarjeta default
              pedido_total = 0;// restablece el total por pagar en el pedido
              
              $('#detalles_items ul li').remove();// Limpia las listas de compras

              //Muestra y serializa todos los elementos de menu escogidos
              for (var i = 0; i < menu_escogido.length; i++) {
                $("#detalles_items ul").append('<li class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">play</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title">( '+menu_escogido[i].cantidad+' )'+ menu_escogido[i].item_nombre +'</div>'
                  +'<div class="item-after">₡ '+ ( menu_escogido[i].cantidad * menu_escogido[i].total ) +'</div>'
                  +'</div>'
                  +'</li>');

                  pedido_total = pedido_total +  ( menu_escogido[i].cantidad * menu_escogido[i].total ) ;
              }

              //Si express fue seleccionado lo adjunto a los detalles
              if( transporte > 0) {

                $("#detalles_items ul").append('<li class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">play</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title">Cargos por transporte</div>'
                  +'<div class="item-after">₡ 800</div>'
                  +'</div>'
                  +'</li>');

                   pedido_total = (pedido_total +  800) ;

              }

              $("#detalles_items ul").append('<li style="background-color: rgb(245, 247, 219);" class="item-content" >'
                  +'<div class="item-media"><i class="f7-icons">bag</i></div>'
                  +'<div class="item-inner">'
                  +'<div class="item-title"></div>'
                  +'<div style="color: #9e9605;font-weight: 800;" class="item-after">Total : ₡ '+pedido_total+'</div>'
                  +'</div>'
                  +'</li>');

              swiPedidos.slideNext(); //Continua a la siguiente vista
          }

    });
  
    //Boton que finaliza y procesa el pedido
    $('.pedidos_procesar').click(function(){

      var payment_method = $('input[name=payment_method]:checked').val();
      var procesar = false; //Estado de proceso para enviar la solicitud

      //Reaccionan al tipo de pago , si es congruente cambian el estado de procesar = true
      if(payment_method == 'Efectivo'){

        if ( $('#con_cuanto_paga').val() <= 0 ) {
          myApp.alert('El monto "pagaré con" no puede ser igual o menor a cero' , 'Pago Efectivo');
        }else{
          procesar = true;
        }
      }
      else if(payment_method == 'Tarjeta'){

        if ( $('#num_tarjeta').val() == '' || $('#input_dueño_nombre').val() == '' ) {
          myApp.alert('Necesitamos los datos del documento' , 'Pago Tarjeta');
        }else{
          procesar = true;
        }
      }

      //Si alguno de los metodos de pagos fue seteado correctamente proceso la solicitud
      if (procesar) {

        pedido_detalle_pago = []; // Limpio los detalles de pago anteriores

        //Serializa los datos de informacion de pago
        pedido_detalle_pago.push({
            modo_pago: $('input[name=payment_method]:checked').val(),
            con_cuanto_paga: $('#con_cuanto_paga').val(),
            dueno_tarjeta: $('#input_dueño_nombre').val(),
            num_tarjeta : $('#num_tarjeta').val(),
            fecha_venc_tarjeta : $('#mes_venc_tarjeta').val()+'/'+$('#año_venc_tarjeta').val(),
        });

        url = "http://www.taqueriachaconpavas.com/api/cliente/pedidos?token="+storage.getItem('token');

        //Muestra el preloader al inciar el proceso
        myApp.showPreloader('Realizando pedido....');
         
        // Envía la solicitud al servidor , serializa a json los datos
        var posting = $.post( url, {
          'pedido_info_entrega' : pedido_info_entrega , 
          'menu_escogido' : menu_escogido,
          'pedido_total' : pedido_total,
          'pedido_detalle_pago' : pedido_detalle_pago
        } )
       
          //Si la respuesta del servidor fue satisfactoria
         .done(function( data ) {

          myApp.hidePreloader(); //Esconde el preloader
        
           //Si el estado fue exitoso (Registro completo)
           myApp.alert("Hemos recibido tu pédido correctamente. Nos pondremos en contacto contigo a la mayor brevedad" , 'Pedido Completado');
           //Lo traslada a login layout
           mainView.router.loadPage("index.html");
         
        })//end .done

         //Si la solicitud al servidor fue erronea
        .fail(function() {
          myApp.alert("Error al conectar con el servidor" , 'Servidor Error');
          myApp.hidePreloader(); //Esconde el preloader
        }); //End .fail

      }// End Procesar

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

}); // End vista de pedidos

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

}); // End vista de registro


//Carga la vista para manejar configuraciones
myApp.onPageInit('configuraciones', function (page) {

  //Carga obtiene la informacion del cliente logueado 
    (function(){ 

        $.ajax({
          url: "http://www.taqueriachaconpavas.com/api/cliente/configuraciones?token="+storage.getItem('token'),
          async: false,
        })

         .done(function(data) {
            var cliente = data;
            $('#name').val(data.name);
            $('#email').val(data.email);
            $('#cedula').val(data.cedula);
            $('#telefono').val(data.telefono);
            $('#fecha_nacimiento').val(data.fecha_nacimiento);
            $('#domicilio').val(data.domicilio);
         })

         .fail(function() {
           myApp.alert('Error al cargar la informacion del usuario' , 'Fallo conexión');
         });
                
    })();

   // Metodo submit del formulario  actualizar los datos del perfil
    $( "#actualizarPerfilForm" ).submit(function( event ) {
      
      // Previene el submit normal y salto de pantalla
      event.preventDefault();
      
      // Obtiene los datos del formulario
      var $form = $( this ),
        name = $form.find( "input[name='name']" ).val(),
        email = $form.find( "input[name='email']" ).val(),
        cedula = $form.find( "input[name='cedula']" ).val(),
        telefono = $form.find( "input[name='telefono']" ).val(),
        fecha_nacimiento = $form.find( "input[name='fecha_nacimiento']" ).val(),
        domicilio = $form.find( "input[name='domicilio']" ).val(),
        url = $form.attr( "action" );

      //Muestra el preloader al inciar el proceso
      myApp.showPreloader('Actualizando datos...');
       
      // Envía la solicitud al servidor , serializa a json los datos
      var posting = $.post( url+"?token="+storage.getItem('token'), 
      { name : name , email:email,cedula:cedula , telefono:telefono , 
        fecha_nacimiento:fecha_nacimiento , domicilio:domicilio } )
     
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
      
    }); //End evento on submit del formulario actualizar los datos del perfil

     // Metodo submit del formulario  actualizar los datos del perfil
    $( "#actualizarPerfilPasswordForm" ).submit(function( event ) {
      
      // Previene el submit normal y salto de pantalla
      event.preventDefault();
      
      // Obtiene los datos del formulario
      var $form = $( this ),
        password = $form.find( "input[name='password']" ).val(),
        new_password = $form.find( "input[name='new_password']" ).val(),
        re_password = $form.find( "input[name='re_password']" ).val(),
        url = $form.attr( "action" );

      //Muestra el preloader al inciar el proceso
      myApp.showPreloader('Actualizando seguridad...');
       
      // Envía la solicitud al servidor , serializa a json los datos
      var posting = $.post( url+"?token="+storage.getItem('token'), 
      { password : password , new_password : new_password, re_password : re_password } )
     
        //Si la respuesta del servidor fue satisfactoria
       .done(function( data ) {

        myApp.hidePreloader(); //Esconde el preloader

        //Si el estado fue exitoso (Registro completo)
        if (data.status == 'success') {
            myApp.alert(data.message , 'Correcto' , function(){

                        myApp.showPreloader('Finalizando...');
                        $.get( "http://www.taqueriachaconpavas.com/api/cliente/logout?token="+storage.getItem('token'))
                          .done(function(data) {
                            myApp.hidePreloader(); // Esconde el preloader
                            storage.setItem('token', null); // Elimina el token de autenticacion
                            mainView.router.loadPage("login.html");
                          })
                          .fail(function() {
                            myApp.hidePreloader(); // Esconde el preloader
                            myApp.alert('Ha ocurrido un error al finalizar la session' , 'Error');
                          });

            });
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
      
    }); //End evento on submit del formulario actualizar los datos del perfil


}); // End vista de configuraciones


//Carga la vista para manejar configuraciones
myApp.onPageInit('premios', function (page) {

 //Carga obtiene la informacion del cliente logueado 
    (function(){ 

        $.ajax({
          url: "http://www.taqueriachaconpavas.com/api/cliente/premios?token="+storage.getItem('token'),
          async: false,
        })

         .done(function(data) {
           console.log(data);
           var cumpleCliente = data;

           //Si el cliente esta cumpliendo años y aún no ha canjeado premio
           if(cumpleCliente.diaspasados >= 0 && 
              cumpleCliente.diaspasados <= 5 && 
              cumpleCliente.canjeado==0 && cumpleCliente.mes==01 ){
              $('#canjea-tu-premio').show();
           }
           //si el cliente esta cumplieando años pero ya tiro de la ruleta y aun no ha canjeado su premio
           else if( cumpleCliente.diaspasados >= 0 && 
                    cumpleCliente.diaspasados <= 5 && 
                    cumpleCliente.canjeado==1 && cumpleCliente.mes==01 &&
                    cumpleCliente.premio.estado_premio == 0 ){

              if(cumpleCliente.premio.nombre_premio == 'hamburguesa'){
                $("#premio_imagen").attr("src","img/premios/hamburguesa.png");
                $("#premio_nombre").text('hamburguesa');
              }
              if(cumpleCliente.premio.nombre_premio == 'taco'){
                $("#premio_imagen").attr("src","img/premios/taco.png");
                $("#premio_nombre").text('taco');
              }
              if(cumpleCliente.premio.nombre_premio == 'hotdog'){
                $("#premio_imagen").attr("src","img/premios/hotdog.png");
                $("#premio_nombre").text('hotdog');
              }
              if(cumpleCliente.premio.nombre_premio == 'cono'){
                $("#premio_imagen").attr("src","img/premios/cono.png");
                $("#premio_nombre").text('cono');
              }
              if(cumpleCliente.premio.nombre_premio == 'batido'){
                $("#premio_imagen").attr("src","img/premios/batido.png");
                $("#premio_nombre").text('batido');
              }
              if(cumpleCliente.premio.nombre_premio == 'gaseosa'){
                $("#premio_imagen").attr("src","img/premios/gaseosa.png");
                $("#premio_nombre").text('gaseosa');
              }

              $("#premio_fecha").text( cumpleCliente.premio.created_at.split(' ')[0] );
              $('#revisa-premio-ganado').show();

           }
           else{
              $('#sin-premios-pendientes').show();
           }


         })

         .fail(function() {
           myApp.alert('Error al cargar la informacion del usuario' , 'Fallo conexión');
         });
                
    })();

    $(function(){
        $('.roulette').find('img').hover(function(){
          console.log($(this).height());
        });
        var appendLogMsg = function(msg) {
          $('#msg')
        .append('<p style="color: #2ba20d;font-weight: bolder;" >' + msg + '</p>')
        .scrollTop(100000000);

        }
        var p = {
          startCallback : function() {
            appendLogMsg('Inicia la ruleta');
            $('#speed, #duration').slider('disable');
            $('#stopImageNumber').spinner('disable');
            $('.start').attr('disabled', 'true');
          },
          slowDownCallback : function() {
            appendLogMsg('Deteniendo...');
          },
          stopCallback : function($stopElm) {
            appendLogMsg('La ruleta se ha detenido');
            $('#speed, #duration').slider('enable');
            $('#stopImageNumber').spinner('enable');
            $('.start').removeAttr('disabled');

            myApp.showPreloader('Procesando tu premio...');

            // Envía la solicitud al servidor , serializa a json los datos
            var posting = $.post( 'http://www.taqueriachaconpavas.com/api/cliente/canjeo/premios'+"?token="+storage.getItem('token'), 
            { 'nombre_premio' : $stopElm[0]['title'] } )
        
              //Si la respuesta del servidor fue satisfactoria
            .done(function( data ) {

              myApp.hidePreloader(); //Esconde el preloader
              myApp.alert('Has ganado el siguiente premio: '+$stopElm[0]['title'] , 'Felicidades!!!', function(){
                mainView.router.refreshPage();
              } );

            })//end .done

            //Si la solicitud al servidor fue erronea
            .fail(function() {
              //Muestra una alerta
              myApp.hidePreloader(); //Esconde el preloader
              myApp.alert('Ha ocurrido un error al contactar al servidor' , 'Sin conexión');
            }); //End .fail
          
          }

        }
        var rouletter = $('div.roulette');
        rouletter.roulette(p);  

        $('.start').click(function(){
          rouletter.roulette('start');  
        });

    });

}); // End vista de premios

myApp.onPageInit('invitado_menu', function (page) {
    var form_pedidos = new FormData();
    var menu_escogido = []; //Arreglo de objetos con los menus escogidos en este pedido
    var pedido_info_entrega = [];// Arreglo de objetos con la informacion de entrega
    var pedido_detalle_pago = [];// Arreglo de objetos con la informacion de pago
    var pedido_total // Mantiene el total de pagar en este pedido
    var cliente = null ; // Conserva los datos del cliente
    

    //Inicializador del swipper
    var swiPedidos = new Swiper('.swip-pedidos', {
        pagination: '.swiper-pagination',
        effect: 'fade',
        speed : 1000,
        onlyExternal: true,
        autoHeight : true,
    });

    //Carga obtiene al cliente logueado y carga los select con el menu disponible
    (function(){ 

        $.ajax({
          url: "http://taqueriachacon.dev/api/cliente/menus/invitados",
          async: false,
        })

         .done(function(data) {
           
            var menus = data.menu;
            cliente = data.cliente;

            myApp.smartSelectAddOption('#selector_comidas',"<option style='display=none;' selected='' value=''></option>");
            myApp.smartSelectAddOption('#selector_bebidas',"<option style='display=none;' selected='' value=''></option>");
            myApp.smartSelectAddOption('#selector_postres',"<option style='display=none;' selected='' value=''></option>");

            for ( i in menus) {       

                           if (menus[i].categoria == 'Comidas') {
                                myApp.smartSelectAddOption('#selector_comidas', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +"₡"+menus[i].precio+" " +menus[i].nombre
                                +"</option>");
                            }
                           if (menus[i].categoria == 'Bebidas') {

                                myApp.smartSelectAddOption('#selector_bebidas', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +"₡"+menus[i].precio+" " + menus[i].nombre
                                +"</option>");
                            }
                            if (menus[i].categoria == 'Postres') {

                                myApp.smartSelectAddOption('#selector_postres', 
                                "<option"
                                +" data-option-class=img-small lazy lazy-fadeIn"
                                +" data-option-image=http://www.taqueriachaconpavas.com/"+ menus[i].foto
                                +" title="+menus[i].precio
                                +" value="+menus[i].id+">"
                                +"₡"+menus[i].precio+" " +menus[i].nombre
                                +"</option>");
                            }
  
            } // End for
           
         })

         .fail(function() {
           myApp.alert('Error al cargar la informacion del usuario' , 'Fallo conexión');
         });
                
    })();
});


/**
 * Valida si el usuario tiene una session activa
 * @return boolean
 */
function userAuthenticated(){

   var auth = false;

       $.ajax({
          url: "http://www.taqueriachaconpavas.com/api/cliente/check/auth?token="+storage.getItem('token'),
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
