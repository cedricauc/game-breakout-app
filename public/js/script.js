$(window).on('load', function(){

    const solarsys = $("#solar-system");

    $("#data a").click(function(e) {
        const ref = $(this).attr("class");
        solarsys.removeClass().addClass(ref);
        $(this).parent().find('a').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

    // $("#solar-system .orbit").click(function(e) {
    //     const ref = $(this).attr("id");
    //     solarsys.removeClass().addClass(ref);
    //     $(this).parent().find('a').removeClass('active');
    //     $(this).addClass('active');
    //     e.preventDefault();
    // });

});