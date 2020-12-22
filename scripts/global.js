$(document).ready(function(){
    menubar();
    $('.nav-tabs').children().first().find('a').click();
    $('#detailed').on('shown.bs.tab', () => {
        flow_viz();
    })
    $('.contributers').click(function() {
        $('.chev-expand').toggleClass('chev-expand-open');
    });
});

function modalShow(data){
    $("#myModal").modal("show");
    $('.modal-title').html(data.header);
    $('.modal-body').html(createHtml(data.body));
}

function createHtml(data){
    var html = '<div class="modalPara">'+data.info+'</div>'
    html+= '<div class="modalusagetitle">'+data.usage.head+'</div>'
    if (data.usage.items){
        html += '<ol class="modalList">'
        data.usage.items.forEach(elem => {
            html += '<li class="modalItem">'+elem+'</li>';
        });
        html += '</ol>'
    }
    if(data.usage.note){
        html += `<strong> Note: ${data.usage.note} </strong>`
    }
    return html;
}

function menubar(){
    $('#toggle-menu').click(function(){
        console.log('click');
        let menu = $(this);
        let contentBody = $('.content-body');
        
        if (menu.hasClass('filter-header-close')){
            menu.removeClass('filter-header-close');
            contentBody.removeClass('content-body-menu-close');
            menu.parent().removeClass('filter-close');

            menu.addClass('filter-header-open');            
            contentBody.addClass('content-body-menu-open');
            menu.parent().addClass('filter-open');
        }
        else{
            menu.removeClass('filter-header-open');
            contentBody.removeClass('content-body-menu-open');
            menu.parent().removeClass('filter-open');

            menu.addClass('filter-header-close');
            contentBody.addClass('content-body-menu-close');
            menu.parent().addClass('filter-close');
        }
    });
}