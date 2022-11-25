$(window).on('load', function(){

    const solarsys = $("#solar-system");

    $("#data a").click(function(e) {
        const ref = $(this).attr("class");
        solarsys.removeClass().addClass(ref);
        $(this).parent().find('a').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

    $('.chat-button').click(function(e){
        $('.chat-button').css({"display": "none"});
        $('.chat-box').css({"display": "block"});
    });

    $('.chat-box .chat-box-header p').click(function(e){
        $('.chat-button').css({"display": "block"});
        $('.chat-box').css({"display": "none"});
    })

    $("#addExtra").click(function(e){
        $(".modal").toggleClass("show-modal");
    })

    $(".modal-close-button").click(function(e){
        $(".modal").toggleClass("show-modal");
    })

});