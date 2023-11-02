document.getElementById('font-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const textValue = document.getElementById('text').value;
    const fontSizeValue = document.getElementById('fontsize').value;
    document.querySelectorAll('.font-sample').forEach(function(fontSample) {
        fontSample.textContent = textValue;
        fontSample.style.fontSize = fontSizeValue + 'px';
    });
});