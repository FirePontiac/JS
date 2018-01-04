$(document).ready(function(){
	$('.deleteUser').on('click', deleteUser);
});

function deleteUser(){   // только выводит их БД ID в консоль после подтверждения в броузере
	var confirmation = confirm('Are you Sure?');
	if (confirmation) {
		$.ajax ({
			type:'DELETE',
			url: '/users/delete/'+$(this).data('id') // а так удалять того на кого нажали
			// url: '/users/delete/' + $('.deleteUser').data('id') // так удлять первого в БД
		}).done(function(response){
			window.location.replace('/');
		});
		window.location.replace('/');
	} else {
		return false;
	}
}