document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggle-switch');

    toggleSwitch.addEventListener('click', function () {
        toggleSwitch.classList.toggle('active');
    });
});
