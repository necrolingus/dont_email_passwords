// Update the displayed value of each slider
function updateValue(id, value) {
    document.getElementById(`${id}-value`).textContent = value;
  }
  
  // Submit secret and get URL
  $('#secret-form').on('submit', function (e) {
    e.preventDefault();
  
    const secret = $('#secret').val();
    const expire_minutes = 
      parseInt($('#minutes').val()) +
      parseInt($('#hours').val()) * 60 +
      parseInt($('#days').val()) * 1440; // 1440 = 24*60
    const expire_clicks = parseInt($('#clicks').val());
    
    if (expire_minutes == 0) {
      $('#response-text').text("Key TTL must be greater than 0.");
      $('#response-message').show();
      
    } else {
      $.ajax({
        url: '/api/secret',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ secret, expire_minutes, expire_clicks }),
        success: function (response) {
          // Extract the base URL and the unique key
          const baseUrl = response.split('/api/secret')[0];
          const uniqueKey = response.split('/').pop();
          
          // Display the extracted parts
          $('#response-text').text(`${baseUrl}/ui/${uniqueKey}`);
          $('#response-message').show();
        },
        error: function (xhr) {
          // Show error message from server or default to a generic message
          const errorMessage = xhr.responseText || "Something went wrong. Check the /api/config endpoint";
          $('#response-text').text(errorMessage);
          $('#response-message').show();
        }
      });
    }
  });

  // Delete secret
  $('#delete-secret-form').on('submit', function (e) {
    e.preventDefault();

    // Extract the last part of the URL, which is the secret key
    const urlPath = window.location.pathname;
    const secretKey = urlPath.split('/').pop();
  
    $.ajax({
        url: `/api/secret/${secretKey}`,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (response) {
            $('#delete-response-text').text(`${response}`);
        },
        error: function (jqXHR) {
            if (jqXHR.status === 404) {
                $('#delete-response-text').text(`${jqXHR.responseText}`);
            } else {
                $('#delete-response-text').text('An error occurred while deleting the secret.');
            }
        }
    });
});
  
  // Copy response text to clipboard
  function copyToClipboard() {
    const text = document.getElementById('response-text').innerText;
    navigator.clipboard.writeText(text);
  }
  