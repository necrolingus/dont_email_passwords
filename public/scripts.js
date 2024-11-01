// Update the displayed value of each slider
function updateValue(id, value) {
    document.getElementById(`${id}-value`).textContent = value;
  }
  
  // Handle form submission with AJAX
  $('#secret-form').on('submit', function (e) {
    e.preventDefault();
  
    const secret = $('#secret').val();
    const expire_minutes = 
      parseInt($('#minutes').val()) +
      parseInt($('#hours').val()) * 60 +
      parseInt($('#days').val()) * 1440; // 1440 = 24*60
    const expire_clicks = parseInt($('#clicks').val());
  
    $.ajax({
      url: '/api/secret',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ secret, expire_minutes, expire_clicks }),
      success: function (response) {
        $('#response-text').text(`${response}/ui`);
        $('#response-message').show();
      },
      error: function(xhr) {
        $('#response-text').text(xhr.responseText);  // Display error text directly
        $('#response-message').show();
      }
    });
  });
  
  // Copy response text to clipboard
  function copyToClipboard() {
    const text = document.getElementById('response-text').innerText;
    navigator.clipboard.writeText(text);
  }
  