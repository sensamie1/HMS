document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.getElementById('toggle-switch');

    toggleSwitch.addEventListener('click', function () {
        toggleSwitch.classList.toggle('active');
    });
});


// const dollarSign = document.getElementById('dollarSign');
// const hms = document.getElementById('hms');
// const toggleball = document.getElementById('toggle-ball');

// toggleball.addEventListener('click', function() {
//     dollarSign.style.display = 'inline-block';
// })

// toggleball.addEventListener('click', function() {
//     hms.style.display = 'inline-block';
// })


// function showHMS() {
//     if (dollarSign.style.display == 'inline-block') {
//         hms.style.display == 'none';
//     } else {
//         hms.style.display == 'inline-block';
//     }
// }




// Assuming showHMS is defined elsewhere in your code

// window.onload = function() {
//     showHMS();
//   };
  

//   toggleball.addEventListener('click', function() {
//     showHMS();
// })



const dollarSign = document.getElementById('dollarSign');
const hms = document.getElementById('hms');
const toggleball = document.getElementById('toggle-ball');
const togglecontainer = document.getElementById('toggle-container');

// Function to toggle visibility based on current state
function toggleVisibility(element) {
  if (element.style.display === 'none') {
    element.style.display = 'inline-block';
  } else {
    element.style.display = 'none';
  }
}

// Event listener for toggle button click
toggleball.addEventListener('click', function() {
  // Toggle visibility of dollarSign
  toggleVisibility(dollarSign);

  // Since only one element should be visible at a time,
  // toggle visibility of hms based on dollarSign's current state
  if (dollarSign.style.display === 'none') {
    toggleVisibility(hms);
  } else {
    hms.style.display = 'none';
  }
});




