$(document).ready(function()
{
 $("#backToList").click(function()
 {
    window.location.replace("http://localhost:2001/mainPage?email=" + email + "&password=" + password);
});
    
});