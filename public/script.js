document.addEventListener('DOMContentLoaded', function () {
  // Initialize the Bootstrap carousel
  var carouselElement = document.querySelector("#carouselExampleControls");

  var carousel = new bootstrap.Carousel(carouselElement, {
    interval: 5000, // Change slide every 5 seconds
    wrap: true      // Infinite loop
  });
});

//  // Event listener for bookmark button
//   var flag=false;
   
//   document.querySelector('.bookmark-btn').addEventListener('click', function() {
//     const bookmarkIcon = document.getElementById('bookmark-icon');
    
//     if (bookmarkIcon.src.includes('h1.png')) {
//       // Change to h2 icon
//       bookmarkIcon.src = '/h2.png';
//       flag=true;
//     } 
//     // else {
//     //   // Change back to h1 icon
//     //   bookmarkIcon.src = '/h1.png';
//     // }
//     // if (bookmarkIcon.src.includes('h2.png') && flag==false) {
//     //   // Change to h2 icon
//     //   bookmarkIcon.src = '/h1.png';
//     // }
//   });
  
// });


document.addEventListener('DOMContentLoaded', () => {
  const bookmarkButtons = document.querySelectorAll('.bookmark-btn');

  bookmarkButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      console.log('Bookmark button clicked');

      event.preventDefault();
      event.stopPropagation();

      const plantId = button.dataset.id;
      const url = `/add-to-bookmarks/${plantId}`;
      console.log('Attempting to bookmark plant. URL:', url);

      // Disable the button to prevent multiple clicks
      button.disabled = true;

      // Add a delay before sending the request
      setTimeout(async () => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('Server response:', result);
            if (result.success) {
              alert('Plant added to bookmarks!');
            } else {
              alert('Failed to add plant to bookmarks: ' + (result.error || 'Unknown error'));
            }
          } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            alert('Error adding plant to bookmarks. Status: ' + response.status);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          alert('An error occurred while adding to bookmarks: ' + error.message);
        } finally {
          // Re-enable the button after the operation
          button.disabled = false;
        }
      }, 500); // Add a 500ms delay
    });
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('note-form');
  const noteText = document.getElementById('noteText');
  const noteList = document.getElementById('note-list');

  noteForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const noteContent = noteText.value.trim();

    if (!noteContent) {
      alert("Note cannot be empty!");
      return;
    }

    // Send an AJAX request to save the note
    fetch('/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteText: noteContent }), // Send note text in JSON format
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Add the new note to the DOM
        
        const newNoteItem = document.createElement('li');
        newNoteItem.innerHTML = `${data.note.text} <button class="delete-note" data-id="${data.note._id}">Delete</button>`;
        noteList.appendChild(newNoteItem);
        noteText.value = ''; // Clear the textarea
        
      } else {
        alert("Error saving note. Please try again.");
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  // Add event listener for the delete buttons dynamically
  noteList.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-note')) {
      const noteId = event.target.getAttribute('data-id');
      
      // Send an AJAX request to delete the note
      fetch(`/delete-note/${noteId}`, {
        method: 'POST',
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Remove the note from the DOM
          event.target.parentElement.remove();
        } else {
          alert("Error deleting note.");
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });
});
