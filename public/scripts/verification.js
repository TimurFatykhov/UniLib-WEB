$(document).ready(function()
{
 $("#signUp").click(function()
 {
     $('.container').show();
     $("#signUpForm").children('input[type=text]').val("");
     $("#signUpForm").children('input[type=password]').val("");
     $("#signUpForm").children('input[type="text"]').css("border-color", "lightgray");
     $("#signUpForm").children('input[type="password"]').css("border-color", "lightgray");
 });

 $(".wallpaperDark").click(function()
 {
     $('.container').hide();
 });

 $("#signUpButton").click(function()
 {
     var inputIsIncorrect = false
     if ($("#firstName").val() != "" && 
         $("#lastName").val() != "" && 
         $("#university").val() != "" && 
         $("#faculty").val() != "" && 
         $("#phoneNumber").val() != "" && 
         $("#email").val() != "" && 
         $("#password").val() != "" && 
         $("#repeatedPassword").val() != "")
     {
        $("#signUpForm").children('input[type="text"]').css("border-color", "lightgreen");
         if(!/[a-z|0-9]+@+[a-z].+[a-z]/.test($("#email").val()))
         {
            $("#email").css("border-color", "red");
            $("#email").val("");
            inputIsIncorrect = true;
         }
         if(!/\+[0-9]\ \d{3}\ \d{3}\ \d{2}\ \d{2}/.test($("#phoneNumber").val()))
         {
            $("#phoneNumber").css("border-color", "red");
            $("#phoneNumber").val("");
            inputIsIncorrect = true;
         }
         if(!/[A-Za-z]/.test($("#firstName").val()))
         {
            $("#firstName").css("border-color", "red");
            $("#firstName").val("");
            inputIsIncorrect = true;
         }
         if(!/[A-Za-z]/.test($("#lastName").val()))
         {
            $("#lastName").css("border-color", "red");
            $("#lastName").val("");
            inputIsIncorrect = true;
         }
         if(!/[A-Z]/.test($("#university").val()))
         {
            $("#university").css("border-color", "red");
            $("#university").val("");
            inputIsIncorrect = true;
         }
         if(!/[A-Z]/.test($("#faculty").val()))
         {
            $("#faculty").css("border-color", "red");
            $("#faculty").val("");
            inputIsIncorrect = true;
         }
         if(inputIsIncorrect)
         {
             alert("Darling, check input data")
             return
         }

         if ($("#password").val() == $("#repeatedPassword").val())
         {
            $("#signUpForm").children('input[type="password"]').css("border-color", "lightgreen");
            $.ajax(
                {
                   type: 'POST',
                   url: '/addUser',
                   data: $('#signUpForm').serialize(), 
                   success: function(res) 
                   {
                       if (res != "")
                       {
                           $('.container').hide(); 
                           alert('Welcome! :)')                  
                       }
                       else
                       {
                           alert('This email already occupied. Try another');
                       }
                   },
                   error: function(error) 
                   {
                     alert('Error!');
                   }
                });
         }
         else
         {
            $("#signUpForm").children('input[type="password"]').css("border-color", "red");
             alert("Password repeated incorrectly");
         }
     }
     else
     {
         alert("Some fields are empty, I can't register you :(")
     }
 });

 $('body').on('click', '.message', function(error)
 {
    $('.message').hide();
 });

});