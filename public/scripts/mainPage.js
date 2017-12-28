$(document).ready(function()
{
// admin
var authorsCount = 1;
function hideAddBookContainer()
{
    $('.container').hide();
    for (var i = 2; i <= authorsCount; i++)
    {
       $("#author" + i).remove();
    }
    authorsCount = 1;
    $('#newBook').children('input[type="text"]').val('')
}

 $("#addBook").click(function()
 {
     $('.container').show();
     $("#newBookForm").children('input[type=text]').val("");
     $("#newBookForm").children('input[type=password]').val("");
     $("#newBookForm").children('input[type="text"]').css("border-color", "lightgray");
     $("#newBookForm").children('input[type="password"]').css("border-color", "lightgray");
 });

 $("#add").click(function()
 {
    var inputIsIncorrect = false
    for (var i = 1; i <= authorsCount; i++)
    {
        if ($("#author"+i).val() == "")
        {
            alert("Some fields are empty (check authors)");
            return
        }
        if(!/^[A-Za-z.-]+$/.test($("#author"+i).val()))
        {
           $("#author"+i).css("border-color", "red");
           $("#author"+i).val("");
           inputIsIncorrect = true;
        }
        else
        {
            $("#author"+i).css("border-color", "lightgreen");
        }
    }
    if ($("#name").val() != "" && 
        $("#genre").val() != "" && 
        $("#amount").val() != "" &&
        $("#id").val() != "" && 
        $("#year").val() != "")
    {
       $("#newBookForm").children('input[name!="authors"]').css("border-color", "lightgreen");
        if(!/^[A-Za-z.-]+$/.test($("#name").val()))
        {
           $("#name").css("border-color", "red");
           $("#name").val("");
           inputIsIncorrect = true;
        }
        if(!/^[A-Za-z]+$/.test($("#genre").val()))
        {
           $("#genre").css("border-color", "red");
           $("#genre").val("");
           inputIsIncorrect = true;
        }
        if(( !/^\d+$/.test($("#amount").val() ) || $("#amount").val() < 0))
        {
           $("#amount").css("border-color", "red");
           $("#amount").val("");
           inputIsIncorrect = true;
        }
        if(( !/^\d+$/.test($("#year").val()) ) || $("#year").val() < 1000 || $("#year").val() > 2018)
        {
           $("#year").css("border-color", "red");
           $("#year").val("");
           inputIsIncorrect = true;
        }
        if(inputIsIncorrect)
        {
            alert("Darling, check input data")
            return
        }

        if(authorsCount == 1 )
        {
            alert('hello');
            $("<input type='text' name='authors' id='author" + String(+authorsCount + 1) + "' value='' hidden>").insertAfter("#author" + String(authorsCount));
        }

        $.ajax(
        {
            type: 'POST',
            url: '/addBook',
            data: $('#newBookForm').serialize(), 
            success: function(res) 
            {
                if (res == '')
                {
                    alert("I can't add this book. Maybe ID is occupied");
                }
                else
                {
                    alert("Book added");
                    hideAddBookContainer();
                }
            },
            error: function(err)
            {
                alert("Error");
            }
        });
    }
    else
    {
        alert("Some fields are empty")
    }
 });

 $(".wallpaperDark").click(function()
 {
     hideAddBookContainer();
 });

 $("#moreAuthors").click(function()
 {
    authorsCount++;
   $("<input type='text' name='authors' id='author" + authorsCount + "' placeholder='Name'>").insertAfter("#author" + String(authorsCount - 1));
 });

// user
 $("#showListButton").click(function()
 {
     $('.container').show();
     $.ajax(
         {
             type: 'POST',
             url: '/userBooksWeb',
             data: null,
             success: function(res,req)
             {
                 res = JSON.parse(res);
                 if (res.length == 0)
                 {
                    $('#userBooks').append("<div>No books yet. Search some</div>")
                 }
                 else
                 {
                    $('#userBooks').append('<table class="user">' +
                                           '<caption>Your books</caption>' +
                                                    '<tr>'  +
                                                        '<th> Name </th>' +
                                                        '<th> Author </th>' +
                                                        '<th> Genre </th>' +
                                                        '<th> Year </th>' +
                                                    '</tr>' +
                                                '</table>');
                        for (book in res)
                        {
                            $('.user').append('<tr>'  +
                                                        '<td>' + res[book].name      + '</td>' +
                                                        '<td>' + res[book].authors   + '</td>' +
                                                        '<td>' + res[book].genre     + '</td>' +
                                                        '<td>' + res[book].year      + '</td>' +
                                                     '</tr>');
                        }
                    }
             },
             error: function(res,req)
             {
                alert("Error");
             }
         });
 });

 $(".wallpaperDark").click(function()
 {
     $('#userBooks').empty();
     $('.container').hide();
 });

 // both
 $("#searchButton").click(function()
 {
    var buttonType = 'bookItButton';
    var buttonValue = 'Book';
    $.ajax(
        {
            type: 'POST',
            url: '/userIsAdmin',
            data: $('#searchForm').serialize(), 
            success: function(isAdmin) 
            {
                if(isAdmin == '1')
                {
                    buttonType = 'deleteItButton';
                    buttonValue = 'Delete';
                }
            },
            error: function(err){ alert('Error!');}
        }
    );
     $('#findedBooks').empty();
     if ( $('#searchString').val() != "")
        $.ajax(
            {
            type: 'POST',
            url: '/searchBookWeb',
            data: $('#searchForm').serialize(), 
            success: function(res) 
            {
                res = JSON.parse(res);
                if (res.length > 0)
                {
                    $('#findedBooks').append('<table class="findedBooks">' +
                                                    '<tr>'  +
                                                        '<th> Name </th>' +
                                                        '<th> Author </th>' +
                                                        '<th> Genre </th>' +
                                                        '<th> Year </th>' +
                                                    '</tr>' +
                                                '</table>');

                        for (book in res)
                        {
                            var disabled = '';
                            if (res[book].reserved || res[book].amount < 1)
                            {
                                disabled = 'disabled="disabled"';
                            }
                            $('.findedBooks').append('<tr>'  +
                                                        '<td>' + res[book].name      + '</td>' +
                                                        '<td>' + res[book].authors   + '</td>' +
                                                        '<td>' + res[book].genre     + '</td>' +
                                                        '<td>' + res[book].year      + '</td>' +
                                                        '<td><input type="button" value="' + buttonValue + '" id="' + res[book].id + '" class="' + buttonType + '" '  + disabled + '></td>' +
                                                    '</tr>');
                        }
                }
                else
                {
                    alert('No match');
                }
            },
            error: function(error) 
            {
                alert('Error!');
            }
            });
 });

 $(window).keydown(function(event){
    if( (event.keyCode == 13) ) {
        $("#searchButton").click();
      return false;
    }
  });

 $('body').on('click', '.bookItButton', function(error)
 {
    var id = this.id;
    var button = "#" + id;
    $.ajax(
        {
        type: 'POST',
        url: '/bookItWeb',
        data: {id: id}, 
        success: function(res) 
        {
            alert("Booked :)");
        },
        error: function(error) 
        {
            alert('Error!');
        }
        });

    $("#"+id).attr("disabled", "disabled");
 });

 $('body').on('click', '.deleteItButton', function(error)
 {
    var id = this.id;
    var button = "#" + id;
    var answer = confirm("Delete all info about this book?");
    if (answer)
    {
        $.ajax(
            {
                type: 'POST',
                url: '/deleteIt',
                data: {id: id}, 
                success: function(res) 
                {
                    alert("Deleted :)");
                },
                error: function(error) 
                {
                    alert('Error!');
                }
            });
            $("#"+id).attr("disabled", "disabled");
    }

 });

});
