document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggle-switch');

    toggleSwitch.addEventListener('click', function () {
        toggleSwitch.classList.toggle('active');
    });
});


const dollarSign = document.getElementById('dollarSign');
const hms = document.getElementById('hms');
const toggleball = document.getElementById('toggle-ball');

toggleball.addEventListener('click', function() {
    dollarSign.style.display = 'inline-block';
})

