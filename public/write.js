const publishButton = document.getElementById('publishButton');
const settingContainer = document.getElementById('settingContainer');
const exitSettings = document.getElementById('exitSettings');
const docForm = document.getElementById('docForm');
const postInput = document.getElementById('postInput');

const featuredText = docForm.featuredText;
const charCount = document.querySelector('#charCount .red');

const minLength = 90;
const maxLength = 400;

exitSettings.addEventListener('click', function(e) {
  settingContainer.style.display = 'none';
});

publishButton.addEventListener('click', function(e) {
  settingContainer.style.display = 'block';
});

docForm.addEventListener('submit', function(e) {
  const doc = document.getElementsByClassName('ql-editor')[0];
  postInput.value = doc.innerHTML;
  if (featuredText.value.length > maxLength || featuredText.value.length < minLength || postInput.value.length === 0) {
    e.preventDefault();
    console.log('cant submit');
  }
});

featuredText.addEventListener('keyup', function(e) {
  charCount.innerHTML = `${featuredText.value.length}/400`;
  if (featuredText.value.length >= minLength && featuredText.value.length <= maxLength) {
    charCount.style.color = 'green';
  }else {
    charCount.style.color = 'red';
  }
});
